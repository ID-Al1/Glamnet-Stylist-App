import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TIER_COLORS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";
import { useMessaging } from "@/context/MessagingContext";
import { useTalent } from "@/context/TalentContext";
import { usePortfolio, type PortfolioItem, JOB_TYPES } from "@/context/PortfolioContext";

const JOB_TYPE_LABELS: Record<string, string> = {
  editorial: "Editorial", commercial: "Commercial", events: "Events",
  social: "Social", campaign: "Campaign", film: "Film", runway: "Runway",
};

interface RatingRow {
  id: string;
  score: number;
  comment: string | null;
  createdAt: string;
  reviewerName: string | null;
  reviewerHandle: string | null;
}

interface RatingSummary {
  averageScore: number | null;
  count: number;
  ratings: RatingRow[];
}

export default function TalentDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");
  const { items: portfolioItems, loadPortfolio, isLoading: portfolioLoading } = usePortfolio();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const [pendingComment, setPendingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const { getOrCreateThread } = useMessaging();
  const { talent: allTalent } = useTalent();

  const talent = allTalent.find((t) => t.id === id);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!talent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Talent not found
        </Text>
      </View>
    );
  }

  const fetchRatings = useCallback(async () => {
    try {
      const data = await apiFetch<RatingSummary>(`/ratings/talent/${talent.id}`);
      setRatingSummary(data);
    } catch {
      // non-fatal — ratings section stays hidden
    }
  }, [talent.id]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);
  useEffect(() => { if (talent) loadPortfolio(talent.id); }, [talent?.id]);

  const handleSubmitRating = async () => {
    if (pendingScore === 0) {
      Alert.alert("Select a rating", "Please tap a star to rate this artist.");
      return;
    }
    setSubmittingRating(true);
    try {
      await apiFetch("/ratings", {
        method: "POST",
        body: { revieweeId: talent.id, score: pendingScore, comment: pendingComment || undefined },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowRatingModal(false);
      setPendingScore(0);
      setPendingComment("");
      fetchRatings();
    } catch {
      Alert.alert("Error", "Could not submit rating. Please try again.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const isModel = talent.type === "model";
  const accentColor = isModel ? colors.purple : colors.primary;
  const tierColor = TIER_COLORS[talent.tier] ?? colors.mutedForeground;
  const gold = colors.gold;
  const verifiedCount = Object.values(talent.verification).filter(Boolean).length;

  const handleMessage = async () => {
    Haptics.selectionAsync();
    const threadId = await getOrCreateThread(
      talent.id,
      talent.name,
      talent.role,
      talent.handle,
      talent.type
    );
    router.push(`/messages/${threadId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top nav */}
      <View
        style={[
          styles.navBar,
          {
            paddingTop: paddingTop + 10,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
          Profile
        </Text>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setSaved((v) => !v); }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="bookmark" size={20} color={saved ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile hero */}
        <View
          style={[
            styles.profileHero,
            {
              backgroundColor: accentColor + "10",
              borderRadius: colors.radius + 4,
              borderColor: accentColor + "30",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.heroAvatar,
              {
                backgroundColor: accentColor + "22",
                borderRadius: isModel ? 16 : 24,
                borderColor: accentColor + "40",
                borderWidth: 2,
              },
            ]}
          >
            <Text style={[styles.heroAvatarText, { color: accentColor, fontFamily: "Inter_700Bold" }]}>
              {isModel ? "✦" : talent.name[0]}
            </Text>
            {talent.verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                <Feather name="check" size={8} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {talent.name}
            </Text>
            <Text style={[styles.heroHandle, { color: accentColor, fontFamily: "Inter_500Medium" }]}>
              {talent.handle}
            </Text>
            <Text style={[styles.heroRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {talent.role}
            </Text>
            <View style={styles.heroBadges}>
              {talent.foundingMember && (
                <View style={[styles.badge, { backgroundColor: gold + "18", borderColor: gold + "50", paddingHorizontal: 10 }]}>
                  <Feather name="award" size={10} color={gold} />
                  <Text style={[styles.badgeText, { color: gold, fontFamily: "Inter_700Bold" }]}>
                    Founding Member
                  </Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: tierColor + "18", borderColor: tierColor + "40" }]}>
                <Text style={[styles.badgeText, { color: tierColor, fontFamily: "Inter_600SemiBold" }]}>
                  {talent.tier}
                </Text>
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: talent.available ? colors.greenDim : colors.muted,
                    borderColor: talent.available ? colors.green + "40" : colors.border,
                  },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: talent.available ? colors.green : colors.dim }]} />
                <Text
                  style={[
                    styles.badgeText,
                    { color: talent.available ? colors.green : colors.mutedForeground, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {talent.available ? "Available" : "Booked"}
                </Text>
              </View>
              {talent.settings.instantBook && (
                <View style={[styles.badge, { backgroundColor: colors.greenDim, borderColor: colors.green + "40" }]}>
                  <Feather name="zap" size={9} color={colors.green} />
                  <Text style={[styles.badgeText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
                    Instant
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Key stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Rep Score", value: talent.repScore.toString(), icon: "star" as const, color: colors.accent },
            { label: "Jobs Done", value: talent.jobs.toString(), icon: "briefcase" as const, color: colors.primary },
            { label: "Campaigns", value: talent.campaigns.toString(), icon: "camera" as const, color: colors.purple },
            { label: "Referrals", value: talent.referrals.toString(), icon: "users" as const, color: colors.green },
          ].map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <Feather name={s.icon} size={14} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Rate + house call info */}
        <View style={[styles.rateCard, { backgroundColor: colors.accentDim, borderRadius: colors.radius, borderColor: colors.accent + "30", borderWidth: 1 }]}>
          <View>
            <Text style={[styles.rateLabel, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>Day Rate</Text>
            <Text style={[styles.rateValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>{talent.rate}</Text>
          </View>
          {talent.settings.houseCallsEnabled && (
            <View style={[styles.houseCallBadge, { backgroundColor: colors.greenDim, borderRadius: 8, borderColor: colors.green + "30", borderWidth: 1 }]}>
              <Feather name="home" size={12} color={colors.green} />
              <View>
                <Text style={[styles.houseCallTitle, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
                  House Calls
                </Text>
                <Text style={[styles.houseCallRate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  +R{talent.settings.callOutBase} + R{talent.settings.callOutRate}/km
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>About</Text>
          <Text style={[styles.bioText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {talent.bio}
          </Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {talent.location} · {talent.province}
            </Text>
          </View>
        </View>

        {/* Verification */}
        <View style={[styles.verifySection, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, borderWidth: 1 }]}>
          <View style={styles.verifyHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Verification
            </Text>
            <Text style={[styles.verifyCount, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
              {verifiedCount}/4
            </Text>
          </View>
          <View style={styles.verifyGrid}>
            {[
              { label: "Identity", checked: talent.verification.identity },
              { label: "Portfolio", checked: talent.verification.portfolio },
              { label: "First Appt", checked: talent.verification.firstAppointment },
              { label: "Skill Assessed", checked: talent.verification.skillAssessment },
            ].map((v) => (
              <View key={v.label} style={styles.verifyItem}>
                <Feather
                  name={v.checked ? "check-circle" : "circle"}
                  size={15}
                  color={v.checked ? colors.green : colors.dim}
                />
                <Text
                  style={[
                    styles.verifyLabel,
                    { color: v.checked ? colors.foreground : colors.mutedForeground, fontFamily: v.checked ? "Inter_500Medium" : "Inter_400Regular" },
                  ]}
                >
                  {v.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Model stats */}
        {isModel && talent.modelStats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Model Stats</Text>
            <View style={styles.modelStatsGrid}>
              {[
                { label: "Height", value: talent.modelStats.height },
                { label: "Measurements", value: talent.modelStats.measurements },
                { label: "Experience", value: talent.modelStats.experience },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={[styles.modelStat, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                >
                  <Text style={[styles.modelStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {stat.label}
                  </Text>
                  <Text style={[styles.modelStatValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.aestheticRow}>
              {talent.modelStats.aesthetic.map((a) => (
                <View key={a} style={[styles.aestheticPill, { backgroundColor: colors.purpleDim, borderColor: colors.purple + "30", borderRadius: 6 }]}>
                  <Text style={[styles.aestheticText, { color: colors.purple, fontFamily: "Inter_500Medium" }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Badges</Text>
          <View style={styles.badgesWrap}>
            {talent.badges.map((b) => (
              <View key={b} style={[styles.fullBadge, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30", borderRadius: 8 }]}>
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.fullBadgeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Collaborations */}
        {talent.collaborations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Frequent Collaborations
            </Text>
            {talent.collaborations.map((c) => (
              <View
                key={c.name}
                style={[styles.collabItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <View style={[styles.collabAvatar, { backgroundColor: colors.primaryDim, borderRadius: 10 }]}>
                  <Text style={[styles.collabAvatarText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    {c.name[0]}
                  </Text>
                </View>
                <View style={styles.collabInfo}>
                  <Text style={[styles.collabName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{c.name}</Text>
                  <Text style={[styles.collabRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c.role}</Text>
                </View>
                <View style={[styles.collabJobs, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                  <Text style={[styles.collabJobsText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    {c.jobs} jobs
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Portfolio */}
        {(portfolioItems.length > 0 || portfolioLoading) && (
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
              <Text style={[styles.avgCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {portfolioItems.length} {portfolioItems.length === 1 ? "credit" : "credits"}
              </Text>
            </View>
            {/* Job type filter pills */}
            {portfolioItems.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                {["all", ...Array.from(new Set(portfolioItems.map((i) => i.jobType)))].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => { Haptics.selectionAsync(); setPortfolioFilter(t); }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: portfolioFilter === t ? colors.primary : colors.muted,
                        borderRadius: colors.radius - 4,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, { color: portfolioFilter === t ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                      {t === "all" ? "All" : JOB_TYPE_LABELS[t] ?? t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {portfolioItems
              .filter((i) => portfolioFilter === "all" || i.jobType === portfolioFilter)
              .map((item: PortfolioItem) => (
                <View
                  key={item.id}
                  style={[styles.portfolioCard, { backgroundColor: colors.card, borderColor: item.isHighlight === "true" ? colors.accent + "50" : colors.border, borderRadius: colors.radius }]}
                >
                  {item.isHighlight === "true" && (
                    <View style={[styles.highlightTag, { backgroundColor: colors.accentDim }]}>
                      <Feather name="star" size={9} color={colors.accent} />
                      <Text style={[styles.highlightTagText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>Highlight</Text>
                    </View>
                  )}
                  <View style={styles.portfolioCardTop}>
                    <View style={[styles.jobTypePill, { backgroundColor: colors.primaryDim, borderRadius: 4 }]}>
                      <Text style={[styles.jobTypeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                        {JOB_TYPE_LABELS[item.jobType] ?? item.jobType}
                      </Text>
                    </View>
                    {item.shootDate && (
                      <Text style={[styles.portfolioDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {item.shootDate}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.portfolioTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {item.title}
                  </Text>
                  {item.brandCredit && (
                    <Text style={[styles.portfolioCredit, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                      {item.brandCredit}{item.agencyCredit ? ` · ${item.agencyCredit}` : ""}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={[styles.portfolioDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>
                      {item.description}
                    </Text>
                  )}
                  {item.imageUrl && (
                    <TouchableOpacity
                      style={[styles.portfolioLink, { borderColor: colors.border, borderRadius: 8 }]}
                      activeOpacity={0.8}
                      onPress={() => Haptics.selectionAsync()}
                    >
                      <Feather name="external-link" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.portfolioLinkText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        View work
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Reviews</Text>
            {ratingSummary && ratingSummary.count > 0 && (
              <View style={styles.avgRow}>
                <Feather name="star" size={13} color={colors.accent} />
                <Text style={[styles.avgScore, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  {ratingSummary.averageScore?.toFixed(1)}
                </Text>
                <Text style={[styles.avgCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  ({ratingSummary.count})
                </Text>
              </View>
            )}
          </View>

          {ratingSummary && ratingSummary.ratings.length > 0 ? (
            ratingSummary.ratings.slice(0, 5).map((r) => (
              <View
                key={r.id}
                style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
              >
                <View style={styles.reviewTop}>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather key={s} name="star" size={11} color={s <= r.score ? colors.accent : colors.dim} />
                    ))}
                  </View>
                  <Text style={[styles.reviewMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {r.reviewerName ?? "Anonymous"}
                  </Text>
                </View>
                {r.comment ? (
                  <Text style={[styles.reviewComment, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                    {r.comment}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={[styles.noReviews, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No reviews yet — be the first.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Rating submission modal */}
      <Modal visible={showRatingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderRadius: colors.radius + 4 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={() => { setShowRatingModal(false); setPendingScore(0); setPendingComment(""); }}>
                <Text style={[styles.modalCancel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
                Rate {talent.name.split(" ")[0]}
              </Text>
              <TouchableOpacity onPress={handleSubmitRating} disabled={submittingRating || pendingScore === 0}>
                <Text style={[styles.modalDone, { color: pendingScore > 0 ? colors.primary : colors.dim, fontFamily: "Inter_700Bold" }]}>
                  {submittingRating ? "..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.starPicker}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { Haptics.selectionAsync(); setPendingScore(s); }}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Feather name="star" size={36} color={s <= pendingScore ? colors.accent : colors.dim} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.starLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {pendingScore === 0 ? "Tap a star to rate" : ["", "Poor", "Fair", "Good", "Great", "Excellent"][pendingScore]}
              </Text>
              <View style={[styles.commentWrap, { borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius }]}>
                <TextInput
                  value={pendingComment}
                  onChangeText={setPendingComment}
                  placeholder="Leave a comment (optional)"
                  placeholderTextColor={colors.dim}
                  multiline
                  style={[styles.commentInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: paddingBottom + 8,
            paddingHorizontal: 16,
            paddingTop: 16,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bookBtn,
            {
              backgroundColor: talent.available ? accentColor : colors.muted,
              borderRadius: colors.radius,
              flex: 1,
            },
          ]}
          onPress={() => {
            if (talent.available) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.push(`/book/${talent.id}`);
            }
          }}
          activeOpacity={0.82}
        >
          <Feather name="calendar" size={16} color={talent.available ? "#fff" : colors.mutedForeground} />
          <Text
            style={[
              styles.bookBtnText,
              { color: talent.available ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" },
            ]}
          >
            {talent.available
              ? talent.settings.instantBook
                ? "⚡ Instant Book"
                : "Book Now"
              : "Currently Booked"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.messageBtn, { borderColor: accentColor, borderRadius: colors.radius, backgroundColor: accentColor + "10" }]}
          onPress={handleMessage}
          activeOpacity={0.82}
        >
          <Feather name="message-circle" size={18} color={accentColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.messageBtn, { borderColor: colors.accent, borderRadius: colors.radius, backgroundColor: colors.accentDim }]}
          onPress={() => { Haptics.selectionAsync(); setShowRatingModal(true); }}
          activeOpacity={0.82}
        >
          <Feather name="star" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  navTitle: { fontSize: 16 },
  scroll: { padding: 16, gap: 14 },
  profileHero: { flexDirection: "row", gap: 16, padding: 16, alignItems: "center" },
  heroAvatar: { width: 72, height: 72, alignItems: "center", justifyContent: "center", position: "relative" },
  heroAvatarText: { fontSize: 28 },
  verifiedBadge: {
    position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  heroInfo: { flex: 1, gap: 3 },
  heroName: { fontSize: 18, letterSpacing: -0.4 },
  heroHandle: { fontSize: 13 },
  heroRole: { fontSize: 12, marginBottom: 4 },
  heroBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap" as const },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 10 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, padding: 10, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, letterSpacing: -0.4 },
  statLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.4, textAlign: "center" },
  rateCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, flexWrap: "wrap" as const, gap: 10 },
  rateLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.8 },
  rateValue: { fontSize: 18, letterSpacing: -0.4 },
  houseCallBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  houseCallTitle: { fontSize: 12 },
  houseCallRate: { fontSize: 10 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, letterSpacing: -0.3 },
  bioText: { fontSize: 13, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12 },
  verifySection: { padding: 14, gap: 12 },
  verifyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verifyCount: { fontSize: 13 },
  verifyGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  verifyItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "45%" as any },
  verifyLabel: { fontSize: 12 },
  modelStatsGrid: { flexDirection: "row", gap: 8 },
  modelStat: { flex: 1, padding: 12, borderWidth: 1, gap: 4 },
  modelStatLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  modelStatValue: { fontSize: 13 },
  aestheticRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" as const },
  aestheticPill: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  aestheticText: { fontSize: 12 },
  badgesWrap: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  fullBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1 },
  fullBadgeText: { fontSize: 12 },
  collabItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1 },
  collabAvatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  collabAvatarText: { fontSize: 16 },
  collabInfo: { flex: 1, gap: 2 },
  collabName: { fontSize: 14 },
  collabRole: { fontSize: 12 },
  collabJobs: { paddingHorizontal: 8, paddingVertical: 4 },
  collabJobsText: { fontSize: 11 },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  avgScore: { fontSize: 14 },
  avgCount: { fontSize: 13 },
  reviewCard: { padding: 12, borderWidth: 1, gap: 6 },
  reviewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewMeta: { fontSize: 11 },
  reviewComment: { fontSize: 13, lineHeight: 18 },
  noReviews: { fontSize: 13 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  filterChipText: { fontSize: 12 },
  portfolioCard: { borderWidth: 1, padding: 14, gap: 8 },
  highlightTag: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  highlightTagText: { fontSize: 10 },
  portfolioCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  jobTypePill: { paddingHorizontal: 8, paddingVertical: 3 },
  jobTypeText: { fontSize: 11 },
  portfolioDate: { fontSize: 11 },
  portfolioTitle: { fontSize: 14, letterSpacing: -0.2 },
  portfolioCredit: { fontSize: 12 },
  portfolioDesc: { fontSize: 12, lineHeight: 17 },
  portfolioLink: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, alignSelf: "flex-start" },
  portfolioLinkText: { fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  modalSheet: { paddingBottom: 32, overflow: "hidden" },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16 },
  modalDone: { fontSize: 15 },
  modalBody: { padding: 24, gap: 16, alignItems: "center" },
  starPicker: { flexDirection: "row", gap: 12 },
  starBtn: { padding: 4 },
  starLabel: { fontSize: 14, height: 20 },
  commentWrap: { width: "100%", borderWidth: 1.5, minHeight: 80, padding: 12 },
  commentInput: { fontSize: 14, textAlignVertical: "top" as const },
  bottomBar: { flexDirection: "row", gap: 10, borderTopWidth: 1 },
  bookBtn: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bookBtnText: { fontSize: 16 },
  messageBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
});

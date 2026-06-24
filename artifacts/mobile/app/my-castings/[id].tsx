import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePostings, type Applicant } from "@/context/PostingsContext";
import { useBookings } from "@/context/BookingContext";
import { useMessaging } from "@/context/MessagingContext";
import { useColors } from "@/hooks/useColors";

const TIER_COLORS: Record<string, string> = {
  Elite: "#B8893A",
  Pro: "#7A5AB8",
  Rising: "#C4526E",
  Active: "#4A7AB8",
  New: "#3A9E6A",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

type FilterStatus = "all" | "pending" | "shortlisted" | "declined";

export default function CastingApplicantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myPostings, shortlistApplicant, declineApplicant, pendingApplicant } = usePostings();
  const { createBooking } = useBookings();
  const { getOrCreateThread } = useMessaging();
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const job = myPostings.find((j) => j.id === id);

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Casting not found
        </Text>
      </View>
    );
  }

  const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "all", label: `All (${job.applicants.length})` },
    { id: "pending", label: `Pending (${job.applicants.filter((a) => a.status === "pending").length})` },
    { id: "shortlisted", label: `Shortlisted (${job.applicants.filter((a) => a.status === "shortlisted").length})` },
    { id: "declined", label: `Declined (${job.applicants.filter((a) => a.status === "declined").length})` },
  ];

  const visible =
    filter === "all" ? job.applicants : job.applicants.filter((a) => a.status === filter);

  const handleMessage = async (applicant: Applicant) => {
    Haptics.selectionAsync();
    const threadId = await getOrCreateThread(
      applicant.talentId,
      applicant.name,
      applicant.specialty,
      applicant.handle,
      "artist"
    );
    router.push(`/messages/${threadId}`);
  };

  const handleShortlist = (applicant: Applicant) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (applicant.status === "shortlisted") {
      pendingApplicant(job.id, applicant.id);
    } else {
      shortlistApplicant(job.id, applicant.id);
    }
  };

  const handleDecline = (applicant: Applicant) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (applicant.status === "declined") {
      pendingApplicant(job.id, applicant.id);
    } else {
      declineApplicant(job.id, applicant.id);
    }
  };

  const handleConfirmHire = async (applicant: Applicant) => {
    if (!job || confirmingId) return;
    setConfirmingId(applicant.id);
    try {
      await createBooking({
        talentId: applicant.talentId,
        jobType: job.type,
        date: job.date,
        location: job.city,
        isHouseCall: false,
        notes: `Casting: ${job.title}`,
        totalCost: job.rateNum,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConfirmedIds((prev) => new Set(prev).add(applicant.id));
    } catch {
      // silently fail — user can retry
    } finally {
      setConfirmingId(null);
    }
  };

  const shortlistedCount = job.applicants.filter((a) => a.status === "shortlisted").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: paddingTop + 10,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {job.applicants.length} applicant{job.applicants.length !== 1 ? "s" : ""} · {job.city}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Summary banner */}
      {shortlistedCount > 0 && (
        <View
          style={[
            styles.shortlistBanner,
            { backgroundColor: colors.greenDim, borderBottomColor: colors.green + "30" },
          ]}
        >
          <Feather name="star" size={13} color={colors.green} />
          <Text style={[styles.shortlistBannerText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
            {shortlistedCount} talent shortlisted for {job.spotsTotal} spot{job.spotsTotal !== 1 ? "s" : ""}
          </Text>
          {shortlistedCount >= job.spotsTotal && (
            <View style={[styles.fullBadge, { backgroundColor: colors.green, borderRadius: 6 }]}>
              <Text style={[styles.fullBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>Full</Text>
            </View>
          )}
        </View>
      )}

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, { borderBottomColor: colors.border }]}
        style={[styles.filterScroll, { borderBottomWidth: 1 }]}
      >
        {filterTabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => { Haptics.selectionAsync(); setFilter(t.id); }}
            style={[
              styles.filterTab,
              { borderBottomColor: filter === t.id ? colors.primary : "transparent" },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterTabText,
                {
                  color: filter === t.id ? colors.primary : colors.mutedForeground,
                  fontFamily: filter === t.id ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <View style={styles.emptyFilter}>
            <Feather name="inbox" size={24} color={colors.dim} />
            <Text style={[styles.emptyFilterText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No {filter === "all" ? "" : filter} applicants yet
            </Text>
          </View>
        ) : (
          visible.map((applicant) => {
            const tierColor = TIER_COLORS[applicant.tier] ?? colors.mutedForeground;
            const isExpanded = expanded === applicant.id;

            return (
              <TouchableOpacity
                key={applicant.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  setExpanded(isExpanded ? null : applicant.id);
                }}
                activeOpacity={0.9}
                style={[
                  styles.applicantCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      applicant.status === "shortlisted"
                        ? colors.green + "50"
                        : applicant.status === "declined"
                        ? colors.border
                        : colors.border,
                    borderRadius: colors.radius + 2,
                    borderWidth: applicant.status === "shortlisted" ? 1.5 : 1,
                    opacity: applicant.status === "declined" ? 0.6 : 1,
                  },
                ]}
              >
                {/* Applicant header row */}
                <View style={styles.applicantHeader}>
                  {/* Avatar */}
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          applicant.status === "shortlisted"
                            ? colors.greenDim
                            : colors.primaryDim,
                        borderRadius: 22,
                        borderColor:
                          applicant.status === "shortlisted"
                            ? colors.green + "40"
                            : colors.primary + "30",
                        borderWidth: 1.5,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        {
                          color:
                            applicant.status === "shortlisted"
                              ? colors.green
                              : colors.primary,
                          fontFamily: "Inter_700Bold",
                        },
                      ]}
                    >
                      {applicant.name[0]}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.applicantInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.applicantName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                        {applicant.name}
                      </Text>
                      <View style={[styles.tierBadge, { backgroundColor: tierColor + "18", borderRadius: 6, borderColor: tierColor + "30", borderWidth: 1 }]}>
                        <Text style={[styles.tierText, { color: tierColor, fontFamily: "Inter_700Bold" }]}>
                          {applicant.tier}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.applicantHandle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {applicant.handle} · {applicant.specialty}
                    </Text>
                    <View style={styles.metaRow}>
                      <Feather name="map-pin" size={10} color={colors.dim} />
                      <Text style={[styles.metaText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
                        {applicant.location}
                      </Text>
                      <View style={[styles.repChip, { backgroundColor: colors.accentDim, borderRadius: 5 }]}>
                        <Feather name="star" size={9} color={colors.accent} />
                        <Text style={[styles.repText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                          {applicant.repScore}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status / chevron */}
                  <View style={styles.applicantRight}>
                    {applicant.status === "shortlisted" ? (
                      <View style={[styles.statusDot, { backgroundColor: colors.green }]} />
                    ) : applicant.status === "declined" ? (
                      <View style={[styles.statusDot, { backgroundColor: colors.dim }]} />
                    ) : (
                      <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
                    )}
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={colors.dim}
                    />
                  </View>
                </View>

                {/* Role + time */}
                <View style={styles.roleRow}>
                  <View style={[styles.roleChip, { backgroundColor: colors.primaryDim, borderRadius: 6, borderColor: colors.primary + "30", borderWidth: 1 }]}>
                    <Text style={[styles.roleText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      Applying as {applicant.role}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
                    {timeAgo(applicant.appliedAt)}
                  </Text>
                </View>

                {/* Expanded content */}
                {isExpanded && (
                  <View style={[styles.expanded, { borderTopColor: colors.borderLight }]}>
                    {/* Message */}
                    <View style={[styles.messageBox, { backgroundColor: colors.warm, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1 }]}>
                      <Text style={[styles.messageLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                        Their message
                      </Text>
                      <Text style={[styles.messageText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                        "{applicant.message}"
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => handleMessage(applicant)}
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: colors.muted,
                            borderRadius: colors.radius,
                            borderColor: colors.border,
                            borderWidth: 1,
                            flex: 1,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Feather name="message-circle" size={14} color={colors.foreground} />
                        <Text style={[styles.actionBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                          Message
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDecline(applicant)}
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor:
                              applicant.status === "declined"
                                ? colors.muted
                                : colors.muted,
                            borderRadius: colors.radius,
                            borderColor:
                              applicant.status === "declined"
                                ? colors.border
                                : colors.border,
                            borderWidth: 1,
                            flex: 1,
                          },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name={applicant.status === "declined" ? "rotate-ccw" : "x"}
                          size={14}
                          color={applicant.status === "declined" ? colors.mutedForeground : colors.primary}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            {
                              color:
                                applicant.status === "declined"
                                  ? colors.mutedForeground
                                  : colors.primary,
                              fontFamily: "Inter_600SemiBold",
                            },
                          ]}
                        >
                          {applicant.status === "declined" ? "Undo" : "Decline"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleShortlist(applicant)}
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor:
                              applicant.status === "shortlisted"
                                ? colors.greenDim
                                : colors.primary,
                            borderRadius: colors.radius,
                            borderColor:
                              applicant.status === "shortlisted"
                                ? colors.green + "40"
                                : "transparent",
                            borderWidth: 1,
                            flex: 1.2,
                          },
                        ]}
                        activeOpacity={0.82}
                      >
                        <Feather
                          name={applicant.status === "shortlisted" ? "check" : "star"}
                          size={14}
                          color={applicant.status === "shortlisted" ? colors.green : "#fff"}
                        />
                        <Text
                          style={[
                            styles.actionBtnText,
                            {
                              color:
                                applicant.status === "shortlisted" ? colors.green : "#fff",
                              fontFamily: "Inter_700Bold",
                            },
                          ]}
                        >
                          {applicant.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Confirm booking — only for shortlisted applicants */}
                    {applicant.status === "shortlisted" && (
                      <TouchableOpacity
                        onPress={() => handleConfirmHire(applicant)}
                        disabled={confirmedIds.has(applicant.id) || confirmingId === applicant.id}
                        style={[
                          styles.confirmBtn,
                          {
                            backgroundColor: confirmedIds.has(applicant.id)
                              ? colors.greenDim
                              : colors.accent,
                            borderRadius: colors.radius,
                            borderColor: confirmedIds.has(applicant.id)
                              ? colors.green + "40"
                              : "transparent",
                            borderWidth: 1,
                          },
                        ]}
                        activeOpacity={0.82}
                      >
                        {confirmingId === applicant.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Feather
                              name={confirmedIds.has(applicant.id) ? "check-circle" : "send"}
                              size={14}
                              color={confirmedIds.has(applicant.id) ? colors.green : "#fff"}
                            />
                            <Text
                              style={[
                                styles.confirmBtnText,
                                {
                                  color: confirmedIds.has(applicant.id) ? colors.green : "#fff",
                                  fontFamily: "Inter_700Bold",
                                },
                              ]}
                            >
                              {confirmedIds.has(applicant.id) ? "Booking Sent" : "Confirm Booking"}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* View profile link */}
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.push(`/talent/${applicant.talentId}`);
                      }}
                      style={styles.profileLink}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.profileLinkText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                        View full profile & portfolio →
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center", gap: 2, paddingHorizontal: 12 },
  headerTitle: { fontSize: 15, letterSpacing: -0.3 },
  headerSub: { fontSize: 11 },
  shortlistBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  shortlistBannerText: { fontSize: 13, flex: 1 },
  fullBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  fullBadgeText: { fontSize: 10 },
  filterScroll: {},
  filterRow: { paddingHorizontal: 16, gap: 0 },
  filterTab: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 2 },
  filterTabText: { fontSize: 12 },
  scroll: { padding: 14, gap: 10 },
  emptyFilter: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyFilterText: { fontSize: 14 },
  applicantCard: { padding: 14, gap: 10 },
  applicantHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: 17 },
  applicantInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  applicantName: { fontSize: 15, letterSpacing: -0.2 },
  tierBadge: { paddingHorizontal: 7, paddingVertical: 3 },
  tierText: { fontSize: 9, letterSpacing: 0.3 },
  applicantHandle: { fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 11 },
  repChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2 },
  repText: { fontSize: 10 },
  applicantRight: { alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 5 },
  roleText: { fontSize: 11 },
  timeText: { fontSize: 10 },
  expanded: { borderTopWidth: 1, paddingTop: 12, gap: 12 },
  messageBox: { padding: 12, gap: 6 },
  messageLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.6 },
  messageText: { fontSize: 13, lineHeight: 20, fontStyle: "italic" as const },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: { fontSize: 12 },
  confirmBtn: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  confirmBtnText: { fontSize: 13 },
  profileLink: { alignItems: "center", paddingVertical: 4 },
  profileLinkText: { fontSize: 13 },
});

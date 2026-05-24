import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ALL_TALENT, TIER_COLORS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function TalentDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [saved, setSaved] = useState(false);

  const talent = ALL_TALENT.find((t) => t.id === id);

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

  const isModel = talent.type === "model";
  const accentColor = isModel ? colors.purple : colors.primary;
  const tierColor = TIER_COLORS[talent.tier] ?? colors.mutedForeground;

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
        <Text style={[styles.navTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Profile
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            setSaved((v) => !v);
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather
            name={saved ? "bookmark" : "bookmark"}
            size={20}
            color={saved ? colors.primary : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
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
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: talent.available ? colors.green : colors.dim },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: talent.available ? colors.green : colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {talent.available ? "Available" : "Booked"}
                </Text>
              </View>
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
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Feather name={s.icon} size={14} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Rate */}
        <View
          style={[
            styles.rateCard,
            {
              backgroundColor: colors.accentDim,
              borderRadius: colors.radius,
              borderColor: colors.accent + "30",
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.rateLabel, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
            Day Rate
          </Text>
          <Text style={[styles.rateValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {talent.rate}
          </Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            About
          </Text>
          <Text style={[styles.bioText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {talent.bio}
          </Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {talent.location}
            </Text>
          </View>
        </View>

        {/* Model stats */}
        {isModel && talent.modelStats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Model Stats
            </Text>
            <View style={styles.modelStatsGrid}>
              {[
                { label: "Height", value: talent.modelStats.height },
                { label: "Measurements", value: talent.modelStats.measurements },
                { label: "Experience", value: talent.modelStats.experience },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.modelStat,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
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
                <View
                  key={a}
                  style={[
                    styles.aestheticPill,
                    { backgroundColor: colors.purpleDim, borderColor: colors.purple + "30", borderRadius: 6 },
                  ]}
                >
                  <Text style={[styles.aestheticText, { color: colors.purple, fontFamily: "Inter_500Medium" }]}>
                    {a}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Badges
          </Text>
          <View style={styles.badgesWrap}>
            {talent.badges.map((b) => (
              <View
                key={b}
                style={[
                  styles.fullBadge,
                  {
                    backgroundColor: colors.primaryDim,
                    borderColor: colors.primary + "30",
                    borderRadius: 8,
                  },
                ]}
              >
                <Feather name="award" size={12} color={colors.primary} />
                <Text style={[styles.fullBadgeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {b}
                </Text>
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
                style={[
                  styles.collabItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View
                  style={[
                    styles.collabAvatar,
                    { backgroundColor: colors.primaryDim, borderRadius: 10 },
                  ]}
                >
                  <Text style={[styles.collabAvatarText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    {c.name[0]}
                  </Text>
                </View>
                <View style={styles.collabInfo}>
                  <Text style={[styles.collabName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {c.name}
                  </Text>
                  <Text style={[styles.collabRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {c.role}
                  </Text>
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
      </ScrollView>

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
            }
          }}
          activeOpacity={0.82}
        >
          <Feather name="calendar" size={16} color={talent.available ? "#fff" : colors.mutedForeground} />
          <Text
            style={[
              styles.bookBtnText,
              {
                color: talent.available ? "#fff" : colors.mutedForeground,
                fontFamily: "Inter_700Bold",
              },
            ]}
          >
            {talent.available ? "Book Now" : "Currently Booked"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.messageBtn,
            {
              borderColor: accentColor,
              borderRadius: colors.radius,
            },
          ]}
          onPress={() => Haptics.selectionAsync()}
          activeOpacity={0.82}
        >
          <Feather name="message-circle" size={18} color={accentColor} />
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
  heroAvatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  heroAvatarText: { fontSize: 28 },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: { flex: 1, gap: 3 },
  heroName: { fontSize: 18, letterSpacing: -0.4 },
  heroHandle: { fontSize: 13 },
  heroRole: { fontSize: 12, marginBottom: 4 },
  heroBadges: { flexDirection: "row", gap: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 10 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, padding: 10, borderWidth: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, letterSpacing: -0.4 },
  statLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.4, textAlign: "center" },
  rateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  rateLabel: { fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.8 },
  rateValue: { fontSize: 18, letterSpacing: -0.4 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, letterSpacing: -0.3 },
  bioText: { fontSize: 13, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12 },
  modelStatsGrid: { flexDirection: "row", gap: 8 },
  modelStat: { flex: 1, padding: 12, borderWidth: 1, gap: 4 },
  modelStatLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  modelStatValue: { fontSize: 13 },
  aestheticRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" as const },
  aestheticPill: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  aestheticText: { fontSize: 12 },
  badgesWrap: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  fullBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  fullBadgeText: { fontSize: 12 },
  collabItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1 },
  collabAvatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  collabAvatarText: { fontSize: 16 },
  collabInfo: { flex: 1, gap: 2 },
  collabName: { fontSize: 14 },
  collabRole: { fontSize: 12 },
  collabJobs: { paddingHorizontal: 8, paddingVertical: 4 },
  collabJobsText: { fontSize: 11 },
  bottomBar: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
  },
  bookBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bookBtnText: { fontSize: 16 },
  messageBtn: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
});

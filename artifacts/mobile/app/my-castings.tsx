import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePostings } from "@/context/PostingsContext";
import { useColors } from "@/hooks/useColors";

const TYPE_COLORS: Record<string, string> = {
  Editorial: "#7A5AB8",
  Commercial: "#4A7AB8",
  "TV/Film": "#C4526E",
  Events: "#3A9E6A",
  Bridal: "#B8893A",
  "Social Media": "#C4526E",
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

export default function MyCastingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { myPostings, removePosting, totalApplicants, totalPending } = usePostings();

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const totalShortlisted = myPostings.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === "shortlisted").length,
    0
  );

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
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
            My Castings
          </Text>
          {myPostings.length > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {myPostings.length} active listing{myPostings.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); router.push("/post-job"); }}
          style={[styles.newBtn, { backgroundColor: colors.primaryDim, borderRadius: 10 }]}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {myPostings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryDim, borderRadius: 32 }]}>
              <Feather name="briefcase" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              No castings posted yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Post your first casting call to start receiving applications from SA's top beauty and creative talent.
            </Text>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.push("/post-job"); }}
              style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              activeOpacity={0.82}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={[styles.emptyBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                Post a Casting
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary stats */}
            <View style={styles.statsRow}>
              {[
                { label: "Castings", value: String(myPostings.length), icon: "briefcase" as const, color: colors.purple },
                { label: "Applicants", value: String(totalApplicants), icon: "users" as const, color: colors.primary },
                { label: "Pending", value: String(totalPending), icon: "clock" as const, color: colors.accent },
                { label: "Shortlisted", value: String(totalShortlisted), icon: "star" as const, color: colors.green },
              ].map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <View style={[styles.statIcon, { backgroundColor: s.color + "18", borderRadius: 8 }]}>
                    <Feather name={s.icon} size={14} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Casting list */}
            {myPostings.map((job) => {
              const typeColor = TYPE_COLORS[job.type] ?? colors.primary;
              const pending = job.applicants.filter((a) => a.status === "pending").length;
              const shortlisted = job.applicants.filter((a) => a.status === "shortlisted").length;
              const declined = job.applicants.filter((a) => a.status === "declined").length;
              const spotsLeft = job.spotsTotal - job.spotsFilled;

              return (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => { Haptics.selectionAsync(); router.push(`/my-castings/${job.id}`); }}
                  activeOpacity={0.82}
                  style={[
                    styles.castingCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: pending > 0 ? colors.accent + "50" : colors.border,
                      borderRadius: colors.radius + 2,
                      borderWidth: pending > 0 ? 1.5 : 1,
                    },
                  ]}
                >
                  {/* Header */}
                  <View style={styles.castingCardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor + "15", borderRadius: 8, borderColor: typeColor + "30", borderWidth: 1 }]}>
                      <Text style={[styles.typeText, { color: typeColor, fontFamily: "Inter_600SemiBold" }]}>
                        {job.type}
                      </Text>
                    </View>
                    {pending > 0 && (
                      <View style={[styles.newBadge, { backgroundColor: colors.accent, borderRadius: 8 }]}>
                        <View style={[styles.newDot, { backgroundColor: "#fff" }]} />
                        <Text style={[styles.newBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                          {pending} new
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.castingTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {job.title}
                  </Text>
                  <Text style={[styles.castingClient, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {job.city}, {job.province} · {job.date}
                  </Text>

                  {/* Roles */}
                  <View style={styles.rolesRow}>
                    {job.roles.map((r) => (
                      <View key={r} style={[styles.roleChip, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                        <Text style={[styles.roleText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {r}
                        </Text>
                      </View>
                    ))}
                    <Text style={[styles.rateTag, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                      {job.rate}
                    </Text>
                  </View>

                  {/* Applicant progress */}
                  <View style={[styles.applicantBar, { borderTopColor: colors.borderLight }]}>
                    <View style={styles.applicantCounts}>
                      <View style={styles.countItem}>
                        <View style={[styles.countDot, { backgroundColor: colors.accent }]} />
                        <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {pending} pending
                        </Text>
                      </View>
                      {shortlisted > 0 && (
                        <View style={styles.countItem}>
                          <View style={[styles.countDot, { backgroundColor: colors.green }]} />
                          <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                            {shortlisted} shortlisted
                          </Text>
                        </View>
                      )}
                      {declined > 0 && (
                        <View style={styles.countItem}>
                          <View style={[styles.countDot, { backgroundColor: colors.dim }]} />
                          <Text style={[styles.countText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                            {declined} declined
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardActions}>
                      <Text style={[styles.spotsLeft, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                      </Text>
                      <View style={[styles.reviewBtn, { backgroundColor: colors.primaryDim, borderRadius: 8 }]}>
                        <Text style={[styles.reviewBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                          Review →
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Footer */}
                  <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
                    <Feather name="clock" size={10} color={colors.dim} />
                    <Text style={[styles.footerText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
                      Posted {job.posted} · Deadline {job.deadline}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        removePosting(job.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.removeText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 4 },
  headerCenter: { alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 17, letterSpacing: -0.3 },
  headerSub: { fontSize: 11 },
  newBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 14 },
  emptyState: { alignItems: "center", paddingTop: 50, gap: 14, paddingHorizontal: 20 },
  emptyIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 19, letterSpacing: -0.4, textAlign: "center" },
  emptySub: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, padding: 12, alignItems: "center", gap: 6 },
  statIcon: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, letterSpacing: -0.5 },
  statLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.5, textAlign: "center" },
  castingCard: { padding: 16, gap: 10 },
  castingCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  typeText: { fontSize: 11 },
  newBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5 },
  newDot: { width: 5, height: 5, borderRadius: 3 },
  newBadgeText: { fontSize: 10 },
  castingTitle: { fontSize: 15, letterSpacing: -0.3, lineHeight: 21 },
  castingClient: { fontSize: 12, marginTop: -4 },
  rolesRow: { flexDirection: "row", gap: 6, alignItems: "center", flexWrap: "wrap" as const },
  roleChip: { paddingHorizontal: 8, paddingVertical: 4 },
  roleText: { fontSize: 10 },
  rateTag: { fontSize: 13, marginLeft: "auto" as any },
  applicantBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 12,
  },
  applicantCounts: { flex: 1, flexDirection: "row", gap: 12, flexWrap: "wrap" as const },
  countItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  countText: { fontSize: 11 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  spotsLeft: { fontSize: 10 },
  reviewBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  reviewBtnText: { fontSize: 11 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  footerText: { fontSize: 10, flex: 1 },
  removeText: { fontSize: 11 },
});

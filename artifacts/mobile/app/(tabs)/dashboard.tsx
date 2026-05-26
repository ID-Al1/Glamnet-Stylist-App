import { Feather } from "@expo/vector-icons";
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

import { router } from "expo-router";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationsContext";
import { usePostings } from "@/context/PostingsContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { totalApplied, applications } = useApplications();
  const { myPostings, totalApplicants, totalPending } = usePostings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "castings" | "analytics">("overview");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const repPct = Math.min((user?.repScore ?? 0) / 100, 1);
  const shortlisted = myPostings.reduce(
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
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn} activeOpacity={0.7}>
          <Feather name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Dashboard
        </Text>
        <TouchableOpacity
          style={styles.menuBtn}
          activeOpacity={0.7}
          onPress={() => { Haptics.selectionAsync(); router.push("/settings"); }}
        >
          <Feather name="settings" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["overview", "castings", "analytics"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[
              styles.tabBtn,
              { borderBottomColor: activeTab === tab ? colors.primary : "transparent" },
            ]}
            activeOpacity={0.75}
          >
            <View style={styles.tabBtnInner}>
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color: activeTab === tab ? colors.primary : colors.mutedForeground,
                    fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {tab === "overview" ? "Overview" : tab === "castings" ? "Castings" : "Analytics"}
              </Text>
              {tab === "castings" && totalPending > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.tabBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    {totalPending}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <>
            {/* Welcome banner */}
            <View
              style={[
                styles.welcomeBanner,
                {
                  backgroundColor: colors.warm,
                  borderRadius: colors.radius,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View>
                <Text style={[styles.welcomeGreeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Good to see you,
                </Text>
                <Text style={[styles.welcomeName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {user?.name ?? "Creative"}
                </Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: colors.primary, borderRadius: 8 }]}>
                <Text style={[styles.tierBadgeText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                  {user?.tier ?? "New"}
                </Text>
              </View>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              {[
                { label: "Jobs Done", value: String(user?.jobs ?? 0), icon: "briefcase" as const, color: colors.primary },
                { label: "Applied", value: String(totalApplied), icon: "send" as const, color: colors.purple },
                { label: "Castings Posted", value: String(myPostings.length), icon: "edit-3" as const, color: colors.accent },
                { label: "Earned", value: `R${(user?.earnings ?? 0).toLocaleString()}`, icon: "dollar-sign" as const, color: colors.green },
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
                  <View style={[styles.statIcon, { backgroundColor: s.color + "18", borderRadius: 8 }]}>
                    <Feather name={s.icon} size={16} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rep Score bar */}
            <View
              style={[
                styles.repCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.repHeader}>
                <Text style={[styles.repTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Reputation Score
                </Text>
                <Text style={[styles.repScore, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  {user?.repScore ?? 0}/100
                </Text>
              </View>
              <View style={[styles.repBarBg, { backgroundColor: colors.muted, borderRadius: 4 }]}>
                <View
                  style={[
                    styles.repBarFill,
                    {
                      width: `${repPct * 100}%`,
                      backgroundColor: colors.accent,
                      borderRadius: 4,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.repNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Complete more jobs and get great reviews to increase your score.
              </Text>
            </View>

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              {[
                {
                  icon: "briefcase" as const,
                  label: "My Castings",
                  sub: myPostings.length > 0
                    ? `${totalPending} pending ${totalPending !== 1 ? "applications" : "application"}`
                    : "Post your first casting",
                  color: colors.purple,
                  onPress: () => router.push("/my-castings"),
                  badge: totalPending > 0 ? String(totalPending) : undefined,
                },
                {
                  icon: "send" as const,
                  label: "My Applications",
                  sub: totalApplied > 0
                    ? `${totalApplied} job${totalApplied !== 1 ? "s" : ""} applied`
                    : "Browse the job board",
                  color: colors.primary,
                  onPress: () => router.push("/(tabs)/earn"),
                  badge: undefined,
                },
                {
                  icon: "users" as const,
                  label: "Discover Talent",
                  sub: "Find models, MUAs & more",
                  color: colors.green,
                  onPress: () => (router as any).push("/(tabs)/"),
                  badge: undefined,
                },
                {
                  icon: "settings" as const,
                  label: "Settings",
                  sub: "Availability, rates & prefs",
                  color: colors.accent,
                  onPress: () => router.push("/settings"),
                  badge: undefined,
                },
              ].map((a) => (
                <TouchableOpacity
                  key={a.label}
                  onPress={() => { Haptics.selectionAsync(); a.onPress(); }}
                  activeOpacity={0.82}
                  style={[
                    styles.quickAction,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: a.color + "18", borderRadius: 10 }]}>
                    <Feather name={a.icon} size={17} color={a.color} />
                  </View>
                  <View style={styles.quickActionText}>
                    <Text style={[styles.quickActionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {a.label}
                    </Text>
                    <Text style={[styles.quickActionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {a.sub}
                    </Text>
                  </View>
                  {a.badge ? (
                    <View style={[styles.quickBadge, { backgroundColor: colors.accent, borderRadius: 8 }]}>
                      <Text style={[styles.quickBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                        {a.badge}
                      </Text>
                    </View>
                  ) : (
                    <Feather name="chevron-right" size={16} color={colors.dim} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Applications preview */}
            {totalApplied > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Recent Applications
                </Text>
                {Object.values(applications)
                  .sort((a, b) => b.appliedAt - a.appliedAt)
                  .slice(0, 3)
                  .map((app) => (
                    <View
                      key={app.jobId}
                      style={[
                        styles.appItem,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderRadius: colors.radius,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={[styles.appDot, { backgroundColor: colors.green }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.appRole, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                          Applied as {app.role}
                        </Text>
                        <Text style={[styles.appTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          Job ID: {app.jobId} · Pending review
                        </Text>
                      </View>
                      <View style={[styles.pendingBadge, { backgroundColor: colors.accentDim, borderRadius: 6 }]}>
                        <Text style={[styles.pendingText, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                          Pending
                        </Text>
                      </View>
                    </View>
                  ))}
              </>
            )}
          </>
        )}

        {activeTab === "castings" && (
          <>
            {/* Castings overview */}
            {myPostings.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.primaryDim, borderRadius: 28 }]}>
                  <Feather name="briefcase" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  No castings yet
                </Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Post a casting call to find the right talent for your next project.
                </Text>
                <TouchableOpacity
                  onPress={() => { Haptics.selectionAsync(); router.push("/post-job"); }}
                  style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                  activeOpacity={0.82}
                >
                  <Feather name="plus" size={15} color="#fff" />
                  <Text style={[styles.emptyBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    Post a Casting
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Casting stats */}
                <View style={styles.castingStats}>
                  {[
                    { label: "Posted", value: String(myPostings.length), color: colors.purple },
                    { label: "Applicants", value: String(totalApplicants), color: colors.primary },
                    { label: "Pending", value: String(totalPending), color: colors.accent },
                    { label: "Shortlisted", value: String(shortlisted), color: colors.green },
                  ].map((s) => (
                    <View
                      key={s.label}
                      style={[
                        styles.castingStatCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderRadius: colors.radius,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text style={[styles.castingStatValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                        {s.value}
                      </Text>
                      <Text style={[styles.castingStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* View all button */}
                <TouchableOpacity
                  onPress={() => { Haptics.selectionAsync(); router.push("/my-castings"); }}
                  style={[
                    styles.viewAllBtn,
                    {
                      backgroundColor: colors.primaryDim,
                      borderRadius: colors.radius,
                      borderColor: colors.primary + "40",
                      borderWidth: 1,
                    },
                  ]}
                  activeOpacity={0.82}
                >
                  <Feather name="list" size={16} color={colors.primary} />
                  <Text style={[styles.viewAllText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    Manage All Castings
                  </Text>
                  {totalPending > 0 && (
                    <View style={[styles.viewAllBadge, { backgroundColor: colors.accent, borderRadius: 8 }]}>
                      <Text style={[styles.viewAllBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                        {totalPending} new
                      </Text>
                    </View>
                  )}
                  <Feather name="arrow-right" size={14} color={colors.primary} style={{ marginLeft: "auto" as any }} />
                </TouchableOpacity>

                {/* Castings preview */}
                {myPostings.slice(0, 3).map((job) => {
                  const pending = job.applicants.filter((a) => a.status === "pending").length;
                  return (
                    <TouchableOpacity
                      key={job.id}
                      onPress={() => { Haptics.selectionAsync(); router.push(`/my-castings/${job.id}`); }}
                      activeOpacity={0.82}
                      style={[
                        styles.castingPreviewCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: pending > 0 ? colors.accent + "40" : colors.border,
                          borderRadius: colors.radius,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={styles.castingPreviewRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.castingPreviewTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                            {job.title}
                          </Text>
                          <Text style={[styles.castingPreviewSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                            {job.city} · {job.date}
                          </Text>
                        </View>
                        <View style={styles.castingPreviewRight}>
                          <Text style={[styles.castingApplicantCount, { color: pending > 0 ? colors.accent : colors.foreground, fontFamily: "Inter_700Bold" }]}>
                            {job.applicants.length}
                          </Text>
                          <Text style={[styles.castingApplicantLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                            {job.applicants.length !== 1 ? "applicants" : "applicant"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <View style={styles.analyticsSection}>
            {[
              { label: "Profile Views", value: "42", trend: "+12%", color: colors.blue },
              { label: "Job Applications", value: String(totalApplied), trend: totalApplied > 0 ? "Active" : "—", color: colors.purple },
              { label: "Casting Applicants", value: String(totalApplicants), trend: totalApplicants > 0 ? "Active" : "—", color: colors.primary },
              { label: "Rep Score", value: String(user?.repScore ?? 0), trend: `${user?.tier ?? "New"}`, color: colors.accent },
            ].map((m) => (
              <View
                key={m.label}
                style={[
                  styles.analyticsCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.analyticsLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {m.label}
                  </Text>
                  <Text style={[styles.analyticsValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {m.value}
                  </Text>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: m.color + "18", borderRadius: 8 }]}>
                  <Text style={[styles.trendText, { color: m.color, fontFamily: "Inter_600SemiBold" }]}>
                    {m.trend}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
  menuBtn: { padding: 4 },
  screenTitle: { fontSize: 18, letterSpacing: -0.5 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  tabBtnInner: { flexDirection: "row", alignItems: "center", gap: 5 },
  tabBtnText: { fontSize: 13 },
  tabBadge: { minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  tabBadgeText: { fontSize: 9 },
  scroll: { padding: 16, gap: 14 },
  welcomeBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  welcomeGreeting: { fontSize: 12, marginBottom: 2 },
  welcomeName: { fontSize: 20, letterSpacing: -0.5 },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  tierBadgeText: { fontSize: 12, letterSpacing: 0.3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  statCard: { width: "48%", padding: 14, borderWidth: 1, gap: 8, alignItems: "flex-start" },
  statIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, letterSpacing: -0.6 },
  statLabel: { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  repCard: { padding: 16, borderWidth: 1, gap: 10 },
  repHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  repTitle: { fontSize: 14 },
  repScore: { fontSize: 16, letterSpacing: -0.3 },
  repBarBg: { height: 8, overflow: "hidden" },
  repBarFill: { height: 8 },
  repNote: { fontSize: 12, lineHeight: 16 },
  sectionTitle: { fontSize: 15, letterSpacing: -0.3, marginBottom: -4 },
  quickActions: { gap: 8 },
  quickAction: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1 },
  quickActionIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  quickActionText: { flex: 1, gap: 2 },
  quickActionLabel: { fontSize: 14 },
  quickActionSub: { fontSize: 12 },
  quickBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  quickBadgeText: { fontSize: 11 },
  appItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  appDot: { width: 8, height: 8, borderRadius: 4 },
  appRole: { fontSize: 13 },
  appTime: { fontSize: 11, marginTop: 2 },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  pendingText: { fontSize: 10 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 12, paddingHorizontal: 16 },
  emptyIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, letterSpacing: -0.3, textAlign: "center" },
  emptySub: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, marginTop: 4 },
  emptyBtnText: { fontSize: 14 },
  castingStats: { flexDirection: "row", gap: 8 },
  castingStatCard: { flex: 1, padding: 12, alignItems: "center", gap: 4 },
  castingStatValue: { fontSize: 20, letterSpacing: -0.5 },
  castingStatLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.5, textAlign: "center" },
  viewAllBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  viewAllText: { fontSize: 14 },
  viewAllBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  viewAllBadgeText: { fontSize: 10 },
  castingPreviewCard: { padding: 14 },
  castingPreviewRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  castingPreviewTitle: { fontSize: 14, letterSpacing: -0.2 },
  castingPreviewSub: { fontSize: 11, marginTop: 2 },
  castingPreviewRight: { alignItems: "center" },
  castingApplicantCount: { fontSize: 20, letterSpacing: -0.4 },
  castingApplicantLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.3 },
  analyticsSection: { gap: 10 },
  analyticsCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderWidth: 1 },
  analyticsLabel: { fontSize: 12, marginBottom: 4 },
  analyticsValue: { fontSize: 24, letterSpacing: -0.6 },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  trendText: { fontSize: 12 },
});

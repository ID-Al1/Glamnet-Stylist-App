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

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "analytics">("overview");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const repPct = Math.min((user?.repScore ?? 0) / 100, 1);

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
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Feather name="settings" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["overview", "bookings", "analytics"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[
              styles.tabBtn,
              { borderBottomColor: activeTab === tab ? colors.primary : "transparent" },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  color: activeTab === tab ? colors.primary : colors.mutedForeground,
                  fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
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
                { label: "Jobs Done", value: user?.jobs ?? 0, icon: "briefcase" as const, color: colors.primary },
                { label: "Rep Score", value: user?.repScore ?? 0, icon: "star" as const, color: colors.accent },
                { label: "Referrals", value: user?.referrals ?? 0, icon: "users" as const, color: colors.purple },
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

            {/* Recent activity */}
            <View style={styles.activitySection}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Recent Activity
              </Text>
              {[
                { icon: "check-circle" as const, text: "Profile created successfully", time: "Just now", color: colors.green },
                { icon: "star" as const, text: "Welcome to GlamNet! Your journey starts here.", time: "Today", color: colors.accent },
                { icon: "users" as const, text: "Explore teams and discover amazing talent", time: "Today", color: colors.purple },
              ].map((a, i) => (
                <View
                  key={i}
                  style={[
                    styles.activityItem,
                    { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: a.color + "18", borderRadius: 10 }]}>
                    <Feather name={a.icon} size={14} color={a.color} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityMain, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                      {a.text}
                    </Text>
                    <Text style={[styles.activityTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {a.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === "bookings" && (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={32} color={colors.dim} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No bookings yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Browse jobs in the Earn tab to get your first booking
            </Text>
          </View>
        )}

        {activeTab === "analytics" && (
          <View style={styles.analyticsSection}>
            {[
              { label: "Profile Views", value: "42", trend: "+12%", color: colors.blue },
              { label: "Job Applications", value: "8", trend: "+3%", color: colors.purple },
              { label: "Team Invites Received", value: "3", trend: "New", color: colors.primary },
              { label: "Referral Clicks", value: "11", trend: "+5%", color: colors.green },
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
  tabBtnText: { fontSize: 13 },
  scroll: { padding: 16, gap: 14 },
  welcomeBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  welcomeGreeting: { fontSize: 12, marginBottom: 2 },
  welcomeName: { fontSize: 20, letterSpacing: -0.5 },
  tierBadge: { paddingHorizontal: 12, paddingVertical: 6 },
  tierBadgeText: { fontSize: 12, letterSpacing: 0.3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  statCard: {
    width: "48%",
    padding: 14,
    borderWidth: 1,
    gap: 8,
    alignItems: "flex-start",
  },
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
  activitySection: { gap: 0 },
  sectionTitle: { fontSize: 16, letterSpacing: -0.3, marginBottom: 12 },
  activityItem: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  activityIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  activityText: { flex: 1, gap: 2 },
  activityMain: { fontSize: 13 },
  activityTime: { fontSize: 11 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
  analyticsSection: { gap: 10 },
  analyticsCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderWidth: 1 },
  analyticsLabel: { fontSize: 12, marginBottom: 4 },
  analyticsValue: { fontSize: 24, letterSpacing: -0.6 },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 5 },
  trendText: { fontSize: 12 },
});

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
import { useColors } from "@/hooks/useColors";

interface Job {
  id: string;
  title: string;
  client: string;
  rate: string;
  type: string;
  location: string;
  date: string;
  urgent: boolean;
  roles: string[];
}

const JOBS: Job[] = [
  {
    id: "j1",
    title: "Luxury Brand Editorial Campaign",
    client: "Annique Beauty",
    rate: "R3,500",
    type: "Editorial",
    location: "Johannesburg",
    date: "June 2-3",
    urgent: false,
    roles: ["MUA", "Model", "Photographer"],
  },
  {
    id: "j2",
    title: "Summer Lookbook Shoot",
    client: "Woolworths Fashion",
    rate: "R2,800",
    type: "Commercial",
    location: "Cape Town",
    date: "June 8",
    urgent: true,
    roles: ["Model", "Stylist", "Hair"],
  },
  {
    id: "j3",
    title: "Bridal Hair & Makeup Trial",
    client: "Private Client",
    rate: "R1,600",
    type: "Events",
    location: "Pretoria",
    date: "June 11",
    urgent: false,
    roles: ["MUA", "Hair Stylist"],
  },
  {
    id: "j4",
    title: "Natural Haircare TV Commercial",
    client: "Cantu SA",
    rate: "R4,200",
    type: "TV/Film",
    location: "Johannesburg",
    date: "June 15-16",
    urgent: true,
    roles: ["Model", "Hair", "MUA"],
  },
];

export default function EarnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "referrals" | "payments">("jobs");
  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

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
          Earn
        </Text>
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <Feather name="bell" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["jobs", "referrals", "payments"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[
              styles.tabBtn,
              { borderBottomColor: activeTab === tab ? colors.accent : "transparent" },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  color: activeTab === tab ? colors.accent : colors.mutedForeground,
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
        {activeTab === "jobs" && (
          <>
            {/* Earnings summary */}
            <View style={[styles.earningsCard, { backgroundColor: colors.primary, borderRadius: colors.radius + 4 }]}>
              <View>
                <Text style={[styles.earningsLabel, { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" }]}>
                  THIS MONTH
                </Text>
                <Text style={[styles.earningsAmount, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  R12,400
                </Text>
                <Text style={[styles.earningsChange, { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular" }]}>
                  +23% from last month
                </Text>
              </View>
              <View style={styles.earningsStats}>
                <View style={styles.earningStat}>
                  <Text style={[styles.earningStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>8</Text>
                  <Text style={[styles.earningStatLabel, { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" }]}>
                    Jobs Done
                  </Text>
                </View>
                <View style={[styles.earningStatDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
                <View style={styles.earningStat}>
                  <Text style={[styles.earningStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>3</Text>
                  <Text style={[styles.earningStatLabel, { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" }]}>
                    Pending
                  </Text>
                </View>
              </View>
            </View>

            {/* Available jobs */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Available Jobs
              </Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {JOBS.length} open
              </Text>
            </View>

            {JOBS.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[
                  styles.jobCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: job.urgent ? colors.primary + "60" : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => Haptics.selectionAsync()}
                activeOpacity={0.8}
              >
                {job.urgent && (
                  <View style={[styles.urgentBadge, { backgroundColor: colors.primary, borderRadius: 6 }]}>
                    <Text style={[styles.urgentText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                      Urgent
                    </Text>
                  </View>
                )}
                <Text style={[styles.jobTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {job.title}
                </Text>
                <Text style={[styles.jobClient, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {job.client}
                </Text>
                <View style={styles.jobMeta}>
                  <View style={styles.jobMetaItem}>
                    <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.jobMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {job.location}
                    </Text>
                  </View>
                  <View style={styles.jobMetaItem}>
                    <Feather name="calendar" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.jobMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {job.date}
                    </Text>
                  </View>
                  <View style={[styles.typePill, { backgroundColor: colors.accentDim, borderRadius: 5 }]}>
                    <Text style={[styles.typeText, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                      {job.type}
                    </Text>
                  </View>
                </View>
                <View style={styles.jobFooter}>
                  <View style={styles.rolesRow}>
                    {job.roles.map((r) => (
                      <View key={r} style={[styles.roleTag, { backgroundColor: colors.muted, borderRadius: 5 }]}>
                        <Text style={[styles.roleTagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {r}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.jobRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                    {job.rate}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === "referrals" && (
          <View style={styles.referralSection}>
            <View style={[styles.referralCard, { backgroundColor: colors.accentDim, borderRadius: colors.radius + 4, borderColor: colors.accent + "40", borderWidth: 1 }]}>
              <Feather name="gift" size={28} color={colors.accent} />
              <Text style={[styles.referralTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Earn R500 per referral
              </Text>
              <Text style={[styles.referralSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Invite friends to join GlamNet. When they complete their first job, you both earn a bonus.
              </Text>
              <TouchableOpacity
                style={[styles.referralBtn, { backgroundColor: colors.accent, borderRadius: colors.radius }]}
                onPress={() => Haptics.selectionAsync()}
                activeOpacity={0.82}
              >
                <Feather name="share-2" size={14} color="#fff" />
                <Text style={[styles.referralBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                  Share Referral Link
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.referralStats}>
              {[
                { label: "Total Referrals", value: "4", color: colors.purple },
                { label: "Pending", value: "2", color: colors.accent },
                { label: "Earned", value: "R1,000", color: colors.green },
              ].map((s) => (
                <View
                  key={s.label}
                  style={[styles.referralStat, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: colors.radius }]}
                >
                  <Text style={[styles.referralStatNum, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.referralStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === "payments" && (
          <View style={styles.paymentsSection}>
            <View style={[styles.paymentSummary, { backgroundColor: colors.warm, borderRadius: colors.radius }]}>
              <Text style={[styles.paymentSummaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Total Earned
              </Text>
              <Text style={[styles.paymentSummaryAmount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                R42,800
              </Text>
              <Text style={[styles.paymentSummaryNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Across 18 jobs
              </Text>
            </View>
            {[
              { title: "Woolworths Campaign", date: "May 20", amount: "R5,600", status: "Paid" },
              { title: "Lerato Dlamini — Collab", date: "May 14", amount: "R2,200", status: "Paid" },
              { title: "Wedding Shoot", date: "May 5", amount: "R3,400", status: "Pending" },
              { title: "Natural Hair Campaign", date: "Apr 28", amount: "R4,200", status: "Paid" },
            ].map((p, i) => (
              <View
                key={i}
                style={[
                  styles.paymentRow,
                  { borderBottomColor: colors.borderLight },
                ]}
              >
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {p.title}
                  </Text>
                  <Text style={[styles.paymentDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {p.date}
                  </Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={[styles.paymentAmount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {p.amount}
                  </Text>
                  <View
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: p.status === "Paid" ? colors.greenDim : colors.accentDim,
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: p.status === "Paid" ? colors.green : colors.accent,
                          fontFamily: "Inter_500Medium",
                        },
                      ]}
                    >
                      {p.status}
                    </Text>
                  </View>
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
  scroll: { padding: 16, gap: 12 },
  earningsCard: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  earningsLabel: { fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  earningsAmount: { fontSize: 32, letterSpacing: -1 },
  earningsChange: { fontSize: 12, marginTop: 2 },
  earningsStats: { flexDirection: "row", gap: 16, alignItems: "center" },
  earningStat: { alignItems: "center", gap: 2 },
  earningStatNum: { fontSize: 22, letterSpacing: -0.5 },
  earningStatLabel: { fontSize: 10 },
  earningStatDivider: { width: 1, height: 30 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 16, letterSpacing: -0.3 },
  sectionCount: { fontSize: 13 },
  jobCard: { borderWidth: 1, padding: 14, marginBottom: 10, gap: 6, position: "relative" },
  urgentBadge: { position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 10 },
  jobTitle: { fontSize: 14, letterSpacing: -0.2, paddingRight: 50 },
  jobClient: { fontSize: 12 },
  jobMeta: { flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" as const },
  jobMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  jobMetaText: { fontSize: 11 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2 },
  typeText: { fontSize: 10 },
  jobFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rolesRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" as const },
  roleTag: { paddingHorizontal: 7, paddingVertical: 3 },
  roleTagText: { fontSize: 10 },
  jobRate: { fontSize: 14, letterSpacing: -0.3 },
  referralSection: { gap: 16 },
  referralCard: { padding: 24, alignItems: "center", gap: 12 },
  referralTitle: { fontSize: 18, textAlign: "center" },
  referralSub: { fontSize: 13, textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  referralBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  referralBtnText: { fontSize: 14 },
  referralStats: { flexDirection: "row", gap: 10 },
  referralStat: { flex: 1, padding: 14, alignItems: "center", gap: 4 },
  referralStatNum: { fontSize: 20, letterSpacing: -0.5 },
  referralStatLabel: { fontSize: 11, textAlign: "center" },
  paymentsSection: { gap: 0 },
  paymentSummary: { padding: 20, alignItems: "center", marginBottom: 16, gap: 4 },
  paymentSummaryLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 1 },
  paymentSummaryAmount: { fontSize: 28, letterSpacing: -0.8 },
  paymentSummaryNote: { fontSize: 12 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  paymentInfo: { gap: 3 },
  paymentTitle: { fontSize: 14 },
  paymentDate: { fontSize: 12 },
  paymentRight: { alignItems: "flex-end", gap: 4 },
  paymentAmount: { fontSize: 14 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10 },
});

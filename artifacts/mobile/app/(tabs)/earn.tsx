import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { JOB_BOARD, JOB_TYPES, type Job } from "@/constants/jobs";
import { SA_PROVINCES } from "@/constants/data";
import { useApplications } from "@/context/ApplicationsContext";
import { useColors } from "@/hooks/useColors";

const TYPE_COLORS: Record<string, string> = {
  Editorial: "#7A5AB8",
  Commercial: "#4A7AB8",
  "TV/Film": "#C4526E",
  Events: "#3A9E6A",
  Bridal: "#B8893A",
  "Social Media": "#C4526E",
};

function JobCard({ job, applied }: { job: Job; applied: boolean }) {
  const colors = useColors();
  const typeColor = TYPE_COLORS[job.type] ?? colors.primary;
  const spotsLeft = job.spotsTotal - job.spotsFilled;

  return (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); router.push(`/jobs/${job.id}`); }}
      activeOpacity={0.82}
      style={[
        styles.jobCard,
        {
          backgroundColor: colors.card,
          borderColor: job.featured
            ? colors.accent + "50"
            : job.urgent
            ? colors.primary + "50"
            : colors.border,
          borderRadius: colors.radius,
          borderWidth: job.featured || job.urgent ? 1.5 : 1,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.cardTopRow}>
        <View style={styles.cardBadges}>
          {job.featured && (
            <View style={[styles.badge, { backgroundColor: colors.accentDim, borderRadius: 6, borderColor: colors.accent + "40", borderWidth: 1 }]}>
              <Feather name="star" size={9} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>Featured</Text>
            </View>
          )}
          {job.urgent && (
            <View style={[styles.badge, { backgroundColor: colors.primaryDim, borderRadius: 6, borderColor: colors.primary + "40", borderWidth: 1 }]}>
              <Feather name="zap" size={9} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Urgent</Text>
            </View>
          )}
          {applied && (
            <View style={[styles.badge, { backgroundColor: colors.greenDim, borderRadius: 6, borderColor: colors.green + "40", borderWidth: 1 }]}>
              <Feather name="check-circle" size={9} color={colors.green} />
              <Text style={[styles.badgeText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>Applied</Text>
            </View>
          )}
        </View>
        <View style={[styles.typePill, { backgroundColor: typeColor + "18", borderRadius: 7, borderColor: typeColor + "30", borderWidth: 1 }]}>
          <Text style={[styles.typeText, { color: typeColor, fontFamily: "Inter_600SemiBold" }]}>{job.type}</Text>
        </View>
      </View>

      <Text style={[styles.jobTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        {job.title}
      </Text>
      <Text style={[styles.jobClient, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {job.client}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{job.city}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{job.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="users" size={11} color={spotsLeft <= 1 ? colors.primary : colors.green} />
          <Text style={[styles.metaText, { color: spotsLeft <= 1 ? colors.primary : colors.green, fontFamily: "Inter_500Medium" }]}>
            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.rolesRow}>
          {job.roles.slice(0, 3).map((r) => (
            <View key={r} style={[styles.roleTag, { backgroundColor: colors.muted, borderRadius: 5 }]}>
              <Text style={[styles.roleTagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r}</Text>
            </View>
          ))}
          {job.roles.length > 3 && (
            <View style={[styles.roleTag, { backgroundColor: colors.muted, borderRadius: 5 }]}>
              <Text style={[styles.roleTagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                +{job.roles.length - 3}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.jobRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>{job.rate}</Text>
      </View>

      <View style={[styles.deadlineRow, { borderTopColor: colors.borderLight }]}>
        <Feather name="clock" size={10} color={colors.dim} />
        <Text style={[styles.deadlineText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
          Apply by {job.deadline} · Posted {job.posted}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EarnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { hasApplied, totalApplied } = useApplications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"jobs" | "referrals" | "payments">("jobs");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "rate" | "deadline">("recent");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filteredJobs = useMemo(() => {
    let jobs = [...JOB_BOARD];
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.client.toLowerCase().includes(q) ||
          j.roles.some((r) => r.toLowerCase().includes(q)) ||
          j.city.toLowerCase().includes(q)
      );
    }
    if (selectedType !== "all") jobs = jobs.filter((j) => j.type === selectedType);
    if (selectedProvince !== "all") jobs = jobs.filter((j) => j.province === selectedProvince);

    if (sortBy === "rate") jobs.sort((a, b) => b.rateNum - a.rateNum);
    else if (sortBy === "deadline") jobs.sort((a, b) => a.deadline.localeCompare(b.deadline));
    else jobs.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return jobs;
  }, [search, selectedType, selectedProvince, sortBy]);

  const activeFilterCount =
    (selectedType !== "all" ? 1 : 0) + (selectedProvince !== "all" ? 1 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: paddingTop + 10, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.menuBtn} activeOpacity={0.7}>
          <Feather name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Earn</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["jobs", "referrals", "payments"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            style={[styles.tabBtn, { borderBottomColor: activeTab === tab ? colors.accent : "transparent" }]}
            activeOpacity={0.75}
          >
            <View style={styles.tabBtnInner}>
              <Text style={[styles.tabBtnText, { color: activeTab === tab ? colors.accent : colors.mutedForeground, fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                {tab === "jobs" ? "Jobs" : tab === "referrals" ? "Referrals" : "Payments"}
              </Text>
              {tab === "jobs" && totalApplied > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.green }]}>
                  <Text style={[styles.tabBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{totalApplied}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "jobs" && (
        <>
          {/* Search + Filter bar */}
          <View style={[styles.searchBar, { paddingHorizontal: 12, paddingVertical: 10, borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}>
            <View style={[styles.searchInputWrap, { backgroundColor: colors.muted, borderRadius: colors.radius, flex: 1 }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search jobs, clients, roles..."
                placeholderTextColor={colors.dim}
                style={[styles.searchText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
                  <Feather name="x" size={13} color={colors.mutedForeground} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); setShowFilters((v) => !v); }}
              style={[styles.filterBtn, { backgroundColor: showFilters || activeFilterCount > 0 ? colors.primaryDim : colors.muted, borderRadius: colors.radius, borderColor: showFilters || activeFilterCount > 0 ? colors.primary + "50" : colors.border, borderWidth: 1 }]}
              activeOpacity={0.75}
            >
              <Feather name="sliders" size={15} color={showFilters || activeFilterCount > 0 ? colors.primary : colors.mutedForeground} />
              {activeFilterCount > 0 && (
                <View style={[styles.filterDot, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.filterDotText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Filter panel */}
          {showFilters && (
            <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                {JOB_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedType(t.id); }}
                    style={[styles.filterChip, { backgroundColor: selectedType === t.id ? colors.primary : colors.muted, borderRadius: 20, borderColor: selectedType === t.id ? colors.primary : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, { color: selectedType === t.id ? "#fff" : colors.mutedForeground, fontFamily: selectedType === t.id ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                {SA_PROVINCES.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => { Haptics.selectionAsync(); setSelectedProvince(p.id); }}
                    style={[styles.filterChip, { backgroundColor: selectedProvince === p.id ? colors.purple : colors.muted, borderRadius: 20, borderColor: selectedProvince === p.id ? colors.purple : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterChipText, { color: selectedProvince === p.id ? "#fff" : colors.mutedForeground, fontFamily: selectedProvince === p.id ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                      {p.id === "all" ? "All Provinces" : p.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.sortRow}>
                <Text style={[styles.sortLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Sort:</Text>
                {(["recent", "rate", "deadline"] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => { Haptics.selectionAsync(); setSortBy(s); }}
                    style={[styles.sortChip, { backgroundColor: sortBy === s ? colors.accentDim : "transparent", borderRadius: 8, borderColor: sortBy === s ? colors.accent + "60" : colors.border, borderWidth: 1 }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.sortChipText, { color: sortBy === s ? colors.accent : colors.mutedForeground, fontFamily: sortBy === s ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                      {s === "recent" ? "Latest" : s === "rate" ? "Highest Rate" : "Deadline"}
                    </Text>
                  </TouchableOpacity>
                ))}
                {activeFilterCount > 0 && (
                  <TouchableOpacity onPress={() => { setSelectedType("all"); setSelectedProvince("all"); }} style={styles.clearBtn} activeOpacity={0.75}>
                    <Text style={[styles.clearText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <View style={[styles.earningsMini, { backgroundColor: colors.primary, borderRadius: colors.radius + 2 }]}>
                  <View>
                    <Text style={[styles.earningsMiniLabel, { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" }]}>THIS MONTH</Text>
                    <Text style={[styles.earningsMiniAmount, { color: "#fff", fontFamily: "Inter_700Bold" }]}>R12,400</Text>
                  </View>
                  <View style={styles.earningsMiniStats}>
                    <View style={styles.miniStat}>
                      <Text style={[styles.miniStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>8</Text>
                      <Text style={[styles.miniStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>Done</Text>
                    </View>
                    <View style={[styles.miniStatDivider, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
                    <View style={styles.miniStat}>
                      <Text style={[styles.miniStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{totalApplied}</Text>
                      <Text style={[styles.miniStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>Applied</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.resultsRow}>
                  <Text style={[styles.resultsCount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
                  </Text>
                  {(search || activeFilterCount > 0) && (
                    <Text style={[styles.resultsFiltered, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>filtered</Text>
                  )}
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="search" size={28} color={colors.dim} />
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No jobs found</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Try different filters or check back later.
                </Text>
                <TouchableOpacity
                  onPress={() => { setSearch(""); setSelectedType("all"); setSelectedProvince("all"); }}
                  style={[styles.clearAllBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.clearAllText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Clear All Filters</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <JobCard job={item} applied={hasApplied(item.id)} />
              </View>
            )}
          />
        </>
      )}

      {activeTab === "referrals" && (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.referralCard, { backgroundColor: colors.accentDim, borderRadius: colors.radius + 4, borderColor: colors.accent + "40", borderWidth: 1 }]}>
            <Feather name="gift" size={28} color={colors.accent} />
            <Text style={[styles.referralTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Earn R500 per referral</Text>
            <Text style={[styles.referralSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Invite friends to join GlamNet. When they complete their first job, you both earn a bonus.
            </Text>
            <TouchableOpacity style={[styles.referralBtn, { backgroundColor: colors.accent, borderRadius: colors.radius }]} onPress={() => Haptics.selectionAsync()} activeOpacity={0.82}>
              <Feather name="share-2" size={14} color="#fff" />
              <Text style={[styles.referralBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>Share Referral Link</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.referralStats}>
            {[
              { label: "Total Referrals", value: "4", color: colors.purple },
              { label: "Pending", value: "2", color: colors.accent },
              { label: "Earned", value: "R1,000", color: colors.green },
            ].map((s) => (
              <View key={s.label} style={[styles.referralStat, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: colors.radius }]}>
                <Text style={[styles.referralStatNum, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                <Text style={[styles.referralStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === "payments" && (
        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.paymentSummary, { backgroundColor: colors.warm, borderRadius: colors.radius }]}>
            <Text style={[styles.paymentSummaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Earned</Text>
            <Text style={[styles.paymentSummaryAmount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>R42,800</Text>
            <Text style={[styles.paymentSummaryNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Across 18 jobs</Text>
          </View>
          {[
            { title: "Woolworths Campaign", date: "May 20", amount: "R5,600", status: "Paid" },
            { title: "Lerato Dlamini — Collab", date: "May 14", amount: "R2,200", status: "Paid" },
            { title: "Wedding Shoot", date: "May 5", amount: "R3,400", status: "Pending" },
            { title: "Natural Hair Campaign", date: "Apr 28", amount: "R4,200", status: "Paid" },
          ].map((p, i) => (
            <View key={i} style={[styles.paymentRow, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.paymentTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{p.title}</Text>
                <Text style={[styles.paymentDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end" as const, gap: 4 }}>
                <Text style={[styles.paymentAmount, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{p.amount}</Text>
                <View style={[styles.statusChip, { backgroundColor: p.status === "Paid" ? colors.greenDim : colors.accentDim, borderRadius: 5 }]}>
                  <Text style={[styles.statusText, { color: p.status === "Paid" ? colors.green : colors.accent, fontFamily: "Inter_500Medium" }]}>{p.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  menuBtn: { padding: 4 },
  screenTitle: { fontSize: 18, letterSpacing: -0.5 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  tabBtnInner: { flexDirection: "row", alignItems: "center", gap: 5 },
  tabBtnText: { fontSize: 13 },
  tabBadge: { minWidth: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  tabBadgeText: { fontSize: 9 },
  searchBar: { flexDirection: "row", gap: 8, alignItems: "center" },
  searchInputWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  searchText: { flex: 1, fontSize: 14 },
  filterBtn: { width: 42, height: 42, alignItems: "center", justifyContent: "center", position: "relative" },
  filterDot: { position: "absolute", top: 6, right: 6, width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  filterDotText: { fontSize: 9 },
  filterPanel: { paddingVertical: 8, gap: 6, borderBottomWidth: 1 },
  filterChips: { paddingHorizontal: 12, gap: 8, flexDirection: "row" },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7 },
  filterChipText: { fontSize: 12 },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12 },
  sortLabel: { fontSize: 12 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5 },
  sortChipText: { fontSize: 11 },
  clearBtn: {},
  clearText: { fontSize: 12 },
  listContent: { padding: 14, gap: 0 },
  listHeader: { gap: 12, marginBottom: 12 },
  earningsMini: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  earningsMiniLabel: { fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  earningsMiniAmount: { fontSize: 26, letterSpacing: -0.8 },
  earningsMiniStats: { flexDirection: "row", gap: 14, alignItems: "center" },
  miniStat: { alignItems: "center", gap: 2 },
  miniStatNum: { fontSize: 20, letterSpacing: -0.4 },
  miniStatLabel: { fontSize: 10 },
  miniStatDivider: { width: 1, height: 28 },
  resultsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  resultsCount: { fontSize: 15, letterSpacing: -0.3 },
  resultsFiltered: { fontSize: 12 },
  cardWrap: { marginBottom: 12 },
  jobCard: { padding: 14, gap: 8 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap" as const },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontSize: 9 },
  typePill: { paddingHorizontal: 9, paddingVertical: 4 },
  typeText: { fontSize: 10 },
  jobTitle: { fontSize: 14, letterSpacing: -0.2, lineHeight: 20 },
  jobClient: { fontSize: 12, marginTop: -2 },
  metaRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" as const },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rolesRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" as const },
  roleTag: { paddingHorizontal: 7, paddingVertical: 3 },
  roleTagText: { fontSize: 10 },
  jobRate: { fontSize: 14, letterSpacing: -0.3 },
  deadlineRow: { flexDirection: "row", alignItems: "center", gap: 5, borderTopWidth: 1, paddingTop: 8 },
  deadlineText: { fontSize: 10 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
  clearAllBtn: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, marginTop: 8 },
  clearAllText: { fontSize: 13 },
  referralCard: { padding: 24, alignItems: "center", gap: 12, marginBottom: 16 },
  referralTitle: { fontSize: 18, textAlign: "center" },
  referralSub: { fontSize: 13, textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  referralBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  referralBtnText: { fontSize: 14 },
  referralStats: { flexDirection: "row", gap: 10 },
  referralStat: { flex: 1, padding: 14, alignItems: "center", gap: 4 },
  referralStatNum: { fontSize: 20, letterSpacing: -0.5 },
  referralStatLabel: { fontSize: 11, textAlign: "center" },
  paymentSummary: { padding: 20, alignItems: "center", marginBottom: 16, gap: 4 },
  paymentSummaryLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 1 },
  paymentSummaryAmount: { fontSize: 28, letterSpacing: -0.8 },
  paymentSummaryNote: { fontSize: 12 },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1 },
  paymentTitle: { fontSize: 14 },
  paymentDate: { fontSize: 12 },
  paymentAmount: { fontSize: 14 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10 },
});

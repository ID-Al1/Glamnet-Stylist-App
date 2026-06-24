import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
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

import { TalentCard } from "@/components/TalentCard";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { SA_PROVINCES, TALENT_CATEGORIES, type Talent } from "@/constants/data";
import { useTalent } from "@/context/TalentContext";
import { useColors } from "@/hooks/useColors";

const MODE_FILTERS = [
  { id: "trending", label: "Trending" },
  { id: "rising", label: "Rising" },
  { id: "campaignReady", label: "Campaign Ready" },
  { id: "instantBook", label: "Instant Book" },
  { id: "houseCalls", label: "House Calls" },
  { id: "newFaces", label: "New Faces" },
];

function filterTalent(
  talent: Talent[],
  category: string,
  mode: string,
  province: string,
  houseCallsOnly: boolean,
  search: string
): Talent[] {
  let result = [...talent];

  if (province !== "all") result = result.filter((t) => t.province === province);
  if (houseCallsOnly) result = result.filter((t) => t.settings.houseCallsEnabled);

  if (category === "model") result = result.filter((t) => t.type === "model");
  else if (category !== "all") result = result.filter((t) => t.artistCategory === category);

  if (mode === "trending") result = result.sort((a, b) => b.jobs - a.jobs);
  else if (mode === "rising") result = result.sort((a, b) => b.repScore - a.repScore).filter((t) => t.repScore < 90);
  else if (mode === "campaignReady") result = result.filter((t) => t.campaigns > 5 && t.available);
  else if (mode === "instantBook") result = result.filter((t) => t.settings.instantBook);
  else if (mode === "houseCalls") result = result.filter((t) => t.settings.houseCallsEnabled);
  else if (mode === "newFaces") result = result.filter((t) => t.tier === "New" || t.tier === "Active");

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.handle.toLowerCase().includes(q)
    );
  }

  return result;
}

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { talent: allTalent } = useTalent();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("trending");
  const [province, setProvince] = useState("all");
  const [houseCallsOnly, setHouseCallsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const talent = filterTalent(allTalent, categoryFilter, modeFilter, province, houseCallsOnly, search);

  const renderItem = useCallback(
    ({ item }: { item: Talent }) => (
      <TalentCard
        talent={item}
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/talent/${item.id}`);
        }}
      />
    ),
    []
  );

  const hasActiveFilters = province !== "all" || houseCallsOnly || categoryFilter !== "all";

  const ListHeader = (
    <View>
      {/* Filter expand panel */}
      {filtersOpen && (
        <View
          style={[
            styles.filterPanel,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              marginBottom: 12,
            },
          ]}
        >
          {/* Panel header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Filters
            </Text>
            <TouchableOpacity onPress={() => setFiltersOpen(false)} activeOpacity={0.7} style={{ padding: 2 }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Province */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Province
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {SA_PROVINCES.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => { Haptics.selectionAsync(); setProvince(p.id); }}
                  activeOpacity={0.75}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: province === p.id ? colors.blue : "transparent",
                      borderColor: province === p.id ? colors.blue : colors.border,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: province === p.id ? "#fff" : colors.foreground,
                        fontFamily: province === p.id ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {p.id === "all" ? p.label : p.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category */}
          <View style={styles.filterGroup}>
            <Text style={[styles.filterGroupLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipRow}>
              {TALENT_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => { Haptics.selectionAsync(); setCategoryFilter(c.id); }}
                  activeOpacity={0.75}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: categoryFilter === c.id ? colors.primary : "transparent",
                      borderColor: categoryFilter === c.id ? colors.primary : colors.border,
                      borderRadius: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: categoryFilter === c.id ? "#fff" : colors.foreground,
                        fontFamily: categoryFilter === c.id ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* House calls toggle */}
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); setHouseCallsOnly((v) => !v); }}
            activeOpacity={0.8}
            style={[
              styles.houseCallToggle,
              {
                backgroundColor: houseCallsOnly ? colors.greenDim : colors.background,
                borderColor: houseCallsOnly ? colors.green + "40" : colors.border,
                borderRadius: 8,
              },
            ]}
          >
            <View style={[styles.checkBox, { backgroundColor: houseCallsOnly ? colors.green : "transparent", borderColor: houseCallsOnly ? colors.green : colors.dim, borderRadius: 4 }]}>
              {houseCallsOnly && <Feather name="check" size={10} color="#fff" />}
            </View>
            <View style={styles.houseCallInfo}>
              <Text style={[styles.houseCallLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                House Calls Only
              </Text>
              <Text style={[styles.houseCallSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Artists who travel to your location
              </Text>
            </View>
            <Feather name="home" size={16} color={houseCallsOnly ? colors.green : colors.dim} />
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setProvince("all");
                setCategoryFilter("all");
                setHouseCallsOnly(false);
              }}
              style={styles.clearFiltersBtn}
              activeOpacity={0.7}
            >
              <Feather name="x" size={12} color={colors.primary} />
              <Text style={[styles.clearFiltersText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Active filter pills */}
      {hasActiveFilters && !filtersOpen && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.activePillRow, { marginBottom: 10 }]}>
          {province !== "all" && (
            <View style={[styles.activePill, { backgroundColor: colors.blueDim, borderColor: colors.blue + "30", borderRadius: 8 }]}>
              <Feather name="map-pin" size={10} color={colors.blue} />
              <Text style={[styles.activePillText, { color: colors.blue, fontFamily: "Inter_500Medium" }]}>
                {province}
              </Text>
            </View>
          )}
          {categoryFilter !== "all" && (
            <View style={[styles.activePill, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "30", borderRadius: 8 }]}>
              <Text style={[styles.activePillText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {TALENT_CATEGORIES.find((c) => c.id === categoryFilter)?.label}
              </Text>
            </View>
          )}
          {houseCallsOnly && (
            <View style={[styles.activePill, { backgroundColor: colors.greenDim, borderColor: colors.green + "30", borderRadius: 8 }]}>
              <Feather name="home" size={10} color={colors.green} />
              <Text style={[styles.activePillText, { color: colors.green, fontFamily: "Inter_500Medium" }]}>
                House Calls
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Mode filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.modeScroll, { marginBottom: 14 }]}>
        {MODE_FILTERS.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => { Haptics.selectionAsync(); setModeFilter(m.id); }}
            activeOpacity={0.75}
            style={[
              styles.modeChip,
              {
                borderBottomColor: modeFilter === m.id ? colors.accent : "transparent",
                borderBottomWidth: 2,
              },
            ]}
          >
            {m.id === "instantBook" && <Feather name="zap" size={10} color={modeFilter === m.id ? colors.accent : colors.dim} />}
            {m.id === "houseCalls" && <Feather name="home" size={10} color={modeFilter === m.id ? colors.accent : colors.dim} />}
            <Text
              style={[
                styles.modeChipText,
                {
                  color: modeFilter === m.id ? colors.accent : colors.mutedForeground,
                  fontFamily: modeFilter === m.id ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {talent.length} {talent.length === 1 ? "result" : "results"}
        {province !== "all" ? ` in ${SA_PROVINCES.find((p) => p.id === province)?.label.split(" — ")[0]}` : ""}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top nav */}
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
        <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.iconBtn} activeOpacity={0.7}>
          <Feather name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary, borderRadius: 8 }]}>
            <Text style={[styles.logoMarkText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>G</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            GlamNet
          </Text>
        </View>

        {/* Placeholder keeps logo centred */}
        <View style={{ width: 30 }} />
      </View>

      {/* Search bar */}
      {searchOpen && (
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 4,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, role, location..."
            placeholderTextColor={colors.dim}
            autoFocus
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          />
          <TouchableOpacity onPress={() => { setSearch(""); setSearchOpen(false); }} activeOpacity={0.7}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={talent}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={32} color={colors.dim} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No talent found
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {hasActiveFilters ? "Try adjusting your filters" : "Try a different search"}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={() => { setProvince("all"); setCategoryFilter("all"); setHouseCallsOnly(false); }}
                style={[styles.clearBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.clearBtnText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ProfileDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFiltersPress={() => setFiltersOpen(true)}
        onSearchPress={() => setSearchOpen(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: 4, position: "relative" },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  logoMarkText: { fontSize: 14 },
  brandName: { fontSize: 18, letterSpacing: -0.5 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  statsBar: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 14, letterSpacing: -0.3 },
  statLabel: { fontSize: 8, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statDivider: { width: 1, alignSelf: "stretch", marginVertical: 4 },

  filterPanel: { padding: 14, borderWidth: 1, gap: 14 },
  filterGroup: { gap: 8 },
  filterGroupLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 1 },
  filterChipRow: { gap: 6, paddingVertical: 2 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  filterChipText: { fontSize: 12 },
  houseCallToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  houseCallInfo: { flex: 1, gap: 2 },
  houseCallLabel: { fontSize: 13 },
  houseCallSub: { fontSize: 11 },
  clearFiltersBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start" },
  clearFiltersText: { fontSize: 12 },

  activePillRow: { gap: 6 },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  activePillText: { fontSize: 11 },

  modeScroll: { gap: 0 },
  modeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeChipText: { fontSize: 12 },
  resultCount: { fontSize: 12, marginBottom: 8 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 14 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, marginTop: 8 },
  clearBtnText: { fontSize: 14 },
});

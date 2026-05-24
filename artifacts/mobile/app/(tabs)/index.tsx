import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TalentCard } from "@/components/TalentCard";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { ALL_TALENT, type Talent } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const TYPE_FILTERS = [
  { id: "all", label: "All Talent" },
  { id: "model", label: "Models" },
  { id: "artist", label: "Artists" },
];

const MODE_FILTERS = [
  { id: "trending", label: "Trending" },
  { id: "rising", label: "Rising" },
  { id: "campaignReady", label: "Campaign Ready" },
  { id: "editorialPicks", label: "Editorial Picks" },
  { id: "newFaces", label: "New Faces" },
];

function filterTalent(talent: Talent[], type: string, mode: string, search: string): Talent[] {
  let result = [...talent];

  if (type === "model") result = result.filter((t) => t.type === "model");
  if (type === "artist") result = result.filter((t) => t.type === "artist");

  if (mode === "trending") result = result.sort((a, b) => b.jobs - a.jobs);
  if (mode === "rising") result = result.sort((a, b) => b.repScore - a.repScore).filter((t) => t.repScore < 90);
  if (mode === "campaignReady") result = result.filter((t) => t.campaigns > 5 && t.available);
  if (mode === "editorialPicks") result = result.filter((t) => t.badges.some((b) => b.includes("Editorial")));
  if (mode === "newFaces") result = result.filter((t) => t.tier === "New" || t.tier === "Active");

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("trending");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const talent = filterTalent(ALL_TALENT, typeFilter, modeFilter, search);

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

  const ListHeader = (
    <View>
      {/* Hero stats bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.warm, borderRadius: colors.radius, marginBottom: 16 }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>247</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Jobs Created
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>R186K</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Paid Out
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.purple, fontFamily: "Inter_700Bold" }]}>
            {ALL_TALENT.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Talent
          </Text>
        </View>
      </View>

      {/* Type filters */}
      <View style={[styles.filterRow, { marginBottom: 10 }]}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => { Haptics.selectionAsync(); setTypeFilter(f.id); }}
            activeOpacity={0.75}
            style={[
              styles.filterChip,
              {
                backgroundColor: typeFilter === f.id ? colors.primary : colors.card,
                borderColor: typeFilter === f.id ? colors.primary : colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color: typeFilter === f.id ? "#fff" : colors.foreground,
                  fontFamily: typeFilter === f.id ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode filters horizontal scroll */}
      <View style={[styles.modeScroll, { marginBottom: 16 }]}>
        {MODE_FILTERS.map((m) => (
          <TouchableOpacity
            key={m.id}
            onPress={() => { Haptics.selectionAsync(); setModeFilter(m.id); }}
            activeOpacity={0.75}
            style={[
              styles.modeChip,
              {
                backgroundColor: modeFilter === m.id ? colors.accentDim : "transparent",
                borderBottomColor: modeFilter === m.id ? colors.accent : "transparent",
                borderBottomWidth: 2,
              },
            ]}
          >
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
      </View>

      <Text style={[styles.resultCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {talent.length} {talent.length === 1 ? "result" : "results"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top nav header */}
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

        <View style={styles.headerTitle}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary, borderRadius: 8 }]}>
            <Text style={[styles.logoMarkText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>G</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            GlamNet
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setSearchOpen((v) => !v); }}
          style={styles.menuBtn}
          activeOpacity={0.7}
        >
          <Feather name={searchOpen ? "x" : "search"} size={20} color={colors.foreground} />
        </TouchableOpacity>
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
              marginBottom: 8,
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
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
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
        scrollEnabled={!!talent.length}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={32} color={colors.dim} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No talent found
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Try adjusting your filters
            </Text>
          </View>
        }
      />

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
    marginTop: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  statsBar: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 16, letterSpacing: -0.3 },
  statLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statDivider: { width: 1, alignSelf: "stretch", marginVertical: 4 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 13 },
  modeScroll: { flexDirection: "row", gap: 0 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modeChipText: { fontSize: 12 },
  resultCount: { fontSize: 12, marginBottom: 8 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 14 },
});

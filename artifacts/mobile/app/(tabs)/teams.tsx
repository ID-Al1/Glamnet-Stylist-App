import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { ALL_TALENT } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Team {
  id: string;
  name: string;
  desc: string;
  rate: string;
  members: string[];
  tags: string[];
  active: boolean;
}

const SAMPLE_TEAMS: Team[] = [
  {
    id: "t1",
    name: "Editorial Collective SA",
    desc: "Premium editorial team for luxury campaigns",
    rate: "R18,000/day",
    members: ["a1", "a4", "m1", "a6"],
    tags: ["Editorial", "Luxury", "Campaign"],
    active: true,
  },
  {
    id: "t2",
    name: "Natural Beauty Squad",
    desc: "Celebrating natural textures and authentic beauty",
    rate: "R12,500/day",
    members: ["a4", "a2", "m3", "a5"],
    tags: ["Natural", "Lifestyle", "Events"],
    active: true,
  },
  {
    id: "t3",
    name: "Runway Ready Crew",
    desc: "High-fashion runway specialists",
    rate: "R22,000/day",
    members: ["m2", "a1", "a7", "a6"],
    tags: ["Runway", "Fashion Week", "High Fashion"],
    active: false,
  },
];

export default function TeamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "my">("discover");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const renderTeam = ({ item }: { item: Team }) => {
    const members = item.members.map((id) => ALL_TALENT.find((t) => t.id === id)).filter(Boolean);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => Haptics.selectionAsync()}
        style={[
          styles.teamCard,
          {
            backgroundColor: colors.card,
            borderColor: item.active ? colors.border : colors.borderLight,
            borderRadius: colors.radius,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.teamHeader}>
          <View style={styles.teamTitleBlock}>
            <Text style={[styles.teamName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {item.name}
            </Text>
            <Text style={[styles.teamDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {item.desc}
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: item.active ? colors.green : colors.dim }]} />
        </View>

        {/* Members */}
        <View style={styles.membersRow}>
          {members.map((m, i) => (
            <View
              key={m!.id}
              style={[
                styles.memberAvatar,
                {
                  backgroundColor: m!.type === "model" ? colors.purpleDim : colors.primaryDim,
                  borderRadius: 10,
                  borderColor: colors.card,
                  marginLeft: i > 0 ? -8 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.memberAvatarText,
                  { color: m!.type === "model" ? colors.purple : colors.primary, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {m!.type === "model" ? "✦" : m!.name[0]}
              </Text>
            </View>
          ))}
          <Text style={[styles.memberCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {members.length} members
          </Text>
        </View>

        {/* Tags + rate */}
        <View style={styles.teamFooter}>
          <View style={styles.tagRow}>
            {item.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.muted, borderRadius: 6 }]}
              >
                <Text style={[styles.tagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.teamRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {item.rate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          Teams
        </Text>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); router.push("/team-builder"); }}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2 }]}
          activeOpacity={0.82}
        >
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {["discover", "my"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { Haptics.selectionAsync(); setActiveTab(tab as "discover" | "my"); }}
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
              {tab === "discover" ? "Discover Teams" : "My Teams"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === "discover" ? SAMPLE_TEAMS : []}
        keyExtractor={(item) => item.id}
        renderItem={renderTeam}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={32} color={colors.dim} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No teams yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Build your first team with the + button above
            </Text>
            <TouchableOpacity
              style={[styles.buildTeamBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={() => router.push("/team-builder")}
              activeOpacity={0.82}
            >
              <Text style={[styles.buildTeamBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                Build a Team
              </Text>
            </TouchableOpacity>
          </View>
        }
        ListHeaderComponent={
          <View style={[styles.teamBuilderCta, { backgroundColor: colors.primaryDim, borderRadius: colors.radius, marginBottom: 16 }]}>
            <View style={styles.teamBuilderCtaText}>
              <Text style={[styles.teamBuilderCtaTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Build your dream team
              </Text>
              <Text style={[styles.teamBuilderCtaSub, { color: colors.primaryDeep, fontFamily: "Inter_400Regular" }]}>
                Assemble models, artists & creatives for your next campaign
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2 }]}
              onPress={() => router.push("/team-builder")}
              activeOpacity={0.82}
            >
              <Feather name="users" size={14} color="#fff" />
              <Text style={[styles.ctaBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                Create
              </Text>
            </TouchableOpacity>
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
  screenTitle: { fontSize: 18, letterSpacing: -0.5 },
  addBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
  },
  tabBtnText: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  teamCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  teamTitleBlock: { flex: 1, gap: 4 },
  teamName: { fontSize: 15, letterSpacing: -0.3 },
  teamDesc: { fontSize: 12, lineHeight: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  memberAvatarText: { fontSize: 11 },
  memberCount: { fontSize: 12, marginLeft: 8 },
  teamFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagRow: { flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10 },
  teamRate: { fontSize: 13, letterSpacing: -0.3 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
  buildTeamBtn: { paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  buildTeamBtnText: { fontSize: 14 },
  teamBuilderCta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 12 },
  teamBuilderCtaText: { flex: 1, gap: 4 },
  teamBuilderCtaTitle: { fontSize: 14 },
  teamBuilderCtaSub: { fontSize: 12, lineHeight: 16 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  ctaBtnText: { fontSize: 13 },
});

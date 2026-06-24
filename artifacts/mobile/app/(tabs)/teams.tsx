import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { useTeams, type Team } from "@/context/TeamsContext";
import { useColors } from "@/hooks/useColors";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function TeamCard({ team, colors }: { team: Team; colors: ReturnType<typeof useColors> }) {
  return (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); router.push(`/team/${team.id}` as any); }}
      activeOpacity={0.82}
      style={[styles.teamCard, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}
    >
      <View style={styles.teamHeader}>
        <View style={styles.teamTitleBlock}>
          <Text style={[styles.teamName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {team.name}
          </Text>
          {team.description ? (
            <Text style={[styles.teamDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
              {team.description}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusDot, { backgroundColor: team.isPublic ? colors.sage : colors.dim }]} />
      </View>

      {team.members.length > 0 && (
        <View style={styles.membersRow}>
          {team.members.slice(0, 4).map((m, i) => (
            <View
              key={m.id}
              style={[
                styles.memberAvatar,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.background,
                  borderRadius: 16,
                  marginLeft: i > 0 ? -8 : 0,
                },
              ]}
            >
              <Text style={[styles.memberAvatarText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {initials(m.name)}
              </Text>
            </View>
          ))}
          {team.memberCount > 4 && (
            <Text style={[styles.memberCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              +{team.memberCount - 4} more
            </Text>
          )}
          {team.memberCount === 0 && (
            <Text style={[styles.memberCount, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
              No members yet
            </Text>
          )}
        </View>
      )}

      <View style={styles.teamFooter}>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: colors.muted, borderRadius: 4 }]}>
            <Text style={[styles.tagText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.primaryDim, borderRadius: 4 }]}>
            <Text style={[styles.tagText, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
              @{team.ownerHandle}
            </Text>
          </View>
        </View>
        {team.dayRate ? (
          <Text style={[styles.teamRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            R{team.dayRate}/day
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function TeamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"discover" | "my">("discover");
  const { discoverTeams, myTeams, isLoadingDiscover, isLoadingMine, refreshDiscover, refreshMine } = useTeams();

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const teams = activeTab === "discover" ? discoverTeams : myTeams;
  const isLoading = activeTab === "discover" ? isLoadingDiscover : isLoadingMine;

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
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
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
        {(["discover", "my"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab);
              if (tab === "discover") refreshDiscover();
              else refreshMine();
            }}
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

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TeamCard team={item} colors={colors} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="users" size={32} color={colors.dim} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                No teams yet
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {activeTab === "my"
                  ? "Build your first team with the + button above"
                  : "No public teams available yet"}
              </Text>
              {activeTab === "my" && (
                <TouchableOpacity
                  style={[styles.buildTeamBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                  onPress={() => router.push("/team-builder")}
                  activeOpacity={0.82}
                >
                  <Text style={[styles.buildTeamBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                    Build a Team
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListHeaderComponent={
            activeTab === "discover" ? (
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
            ) : null
          }
        />
      )}

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
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
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

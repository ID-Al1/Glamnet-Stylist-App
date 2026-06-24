import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useTeams } from "@/context/TeamsContext";
import { useColors } from "@/hooks/useColors";
import { apiFetch } from "@/lib/api";

interface TeamMemberDetail {
  id: string;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
  role: string | null;
  specialties: string[] | null;
  tier: string | null;
}

interface TeamDetail {
  id: string;
  name: string;
  description: string | null;
  dayRate: number | null;
  isPublic: boolean;
  memberCount: number;
  members: TeamMemberDetail[];
  ownerName: string;
  ownerHandle: string;
  ownerAvatarUrl: string | null;
  ownerId: string;
  createdAt: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function TeamDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { deleteTeam, joinTeam, leaveTeam } = useTeams();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const fetchTeam = () => {
    setLoading(true);
    apiFetch<{ team: TeamDetail }>(`/teams/${id}`)
      .then(({ team: t }) => setTeam(t))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTeam(); }, [id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop }]}>
        <Feather name="alert-circle" size={32} color={colors.dim} />
        <Text style={[styles.errorText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Team not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75}>
          <Text style={[styles.backLink, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.id === team.ownerId;
  const isMember = team.members.some((m) => m.id === user?.id);
  const isClient = user?.role === "client";

  const handleDelete = () => {
    Alert.alert(
      "Delete Team",
      `Delete "${team.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteTeam(team.id);
              router.back();
            } catch {
              Alert.alert("Error", "Could not delete team. Try again.");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const updated = await joinTeam(team.id);
      setTeam({ ...team, members: updated.members as TeamMemberDetail[], memberCount: updated.memberCount });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not join team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert("Leave Team", `Leave "${team.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await leaveTeam(team.id);
            fetchTeam();
          } catch {
            Alert.alert("Error", "Could not leave team. Try again.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Team Profile
        </Text>
        {isOwner ? (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.iconBtn, { backgroundColor: colors.destructive + "14", borderRadius: 8 }]}
            activeOpacity={0.75}
            disabled={actionLoading}
          >
            <Feather name="trash-2" size={17} color={colors.destructive} />
          </TouchableOpacity>
        ) : isClient ? (
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); router.push(`/book-team/${team.id}` as any); }}
            style={[styles.hireBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2 }]}
            activeOpacity={0.82}
          >
            <Text style={[styles.hireBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>Hire</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.warm, borderBottomColor: colors.border }]}>
          <View style={[styles.teamIconWrap, { backgroundColor: colors.primaryDim, borderRadius: 16 }]}>
            <Feather name="users" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.teamName, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
            {team.name}
          </Text>
          {team.description ? (
            <Text style={[styles.teamDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {team.description}
            </Text>
          ) : null}

          <View style={styles.pillRow}>
            {team.dayRate ? (
              <View style={[styles.pill, { backgroundColor: colors.accentDim, borderRadius: 20 }]}>
                <Feather name="dollar-sign" size={12} color={colors.accent} />
                <Text style={[styles.pillText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  R{team.dayRate.toLocaleString()}/day
                </Text>
              </View>
            ) : null}
            <View style={[styles.pill, { backgroundColor: colors.muted, borderRadius: 20 }]}>
              <Feather name="user" size={12} color={colors.mutedForeground} />
              <Text style={[styles.pillText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: team.isPublic ? colors.sage + "22" : colors.muted, borderRadius: 20 }]}>
              <View style={[styles.statusDot, { backgroundColor: team.isPublic ? colors.sage : colors.dim }]} />
              <Text style={[styles.pillText, { color: team.isPublic ? colors.sage : colors.dim, fontFamily: "Inter_400Regular" }]}>
                {team.isPublic ? "Public" : "Private"}
              </Text>
            </View>
            {isOwner && (
              <View style={[styles.pill, { backgroundColor: colors.accentDim, borderRadius: 20 }]}>
                <Feather name="star" size={12} color={colors.accent} />
                <Text style={[styles.pillText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                  Your Team
                </Text>
              </View>
            )}
            {isMember && !isOwner && (
              <View style={[styles.pill, { backgroundColor: colors.primaryDim, borderRadius: 20 }]}>
                <Feather name="check" size={12} color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  Member
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Owner */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Owner
          </Text>
          <View style={[styles.ownerCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.ownerAvatar, { backgroundColor: colors.primaryDim, borderRadius: 22 }]}>
              <Text style={[styles.ownerAvatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {initials(team.ownerName)}
              </Text>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={[styles.ownerName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {team.ownerName}
              </Text>
              <Text style={[styles.ownerHandle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                @{team.ownerHandle}
              </Text>
            </View>
            <View style={[styles.ownerBadge, { backgroundColor: colors.accentDim, borderRadius: 6 }]}>
              <Text style={[styles.ownerBadgeText, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                Lead
              </Text>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Team Members
          </Text>
          {team.members.length > 0 ? (
            <View style={styles.membersList}>
              {team.members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => router.push(`/talent/${member.id}` as any)}
                  activeOpacity={0.82}
                  style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                >
                  <View style={[styles.memberAvatar, { backgroundColor: colors.muted, borderRadius: 20 }]}>
                    <Text style={[styles.memberAvatarText, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                      {initials(member.name)}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={[styles.memberName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {member.name}
                    </Text>
                    <Text style={[styles.memberMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {[member.role, member.tier].filter(Boolean).join(" · ")}
                    </Text>
                    {member.specialties && member.specialties.length > 0 && (
                      <View style={styles.specRow}>
                        {member.specialties.slice(0, 3).map((s) => (
                          <View key={s} style={[styles.specChip, { backgroundColor: colors.muted, borderRadius: 4 }]}>
                            <Text style={[styles.specChipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                              {s}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.dim} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.emptyMembers, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Text style={[styles.emptyMembersText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
                No members added yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: paddingBottom + 8,
            paddingHorizontal: 20,
            paddingTop: 14,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : isOwner ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.destructive + "14", borderRadius: colors.radius, borderWidth: 1, borderColor: colors.destructive + "40" }]}
            onPress={handleDelete}
            activeOpacity={0.82}
          >
            <Feather name="trash-2" size={18} color={colors.destructive} />
            <Text style={[styles.ctaBtnText, { color: colors.destructive, fontFamily: "Inter_700Bold" }]}>
              Delete Team
            </Text>
          </TouchableOpacity>
        ) : isClient ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); router.push(`/book-team/${team.id}` as any); }}
            activeOpacity={0.82}
          >
            <Feather name="briefcase" size={18} color="#fff" />
            <Text style={[styles.ctaBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              Hire This Team
            </Text>
          </TouchableOpacity>
        ) : isMember ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.muted, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border }]}
            onPress={handleLeave}
            activeOpacity={0.82}
          >
            <Feather name="log-out" size={18} color={colors.mutedForeground} />
            <Text style={[styles.ctaBtnText, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
              Leave Team
            </Text>
          </TouchableOpacity>
        ) : team.isPublic ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleJoin}
            activeOpacity={0.82}
          >
            <Feather name="user-plus" size={18} color="#fff" />
            <Text style={[styles.ctaBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              Join Team
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.ctaBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
            <Feather name="lock" size={18} color={colors.dim} />
            <Text style={[styles.ctaBtnText, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
              Private Team
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 15 },
  backLink: { fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  hireBtn: { paddingHorizontal: 16, paddingVertical: 7 },
  hireBtnText: { fontSize: 13 },
  scroll: { gap: 0 },
  hero: {
    padding: 20,
    gap: 8,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  teamIconWrap: { width: 64, height: 64, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  teamName: { fontSize: 26, letterSpacing: -0.6, textAlign: "center" },
  teamDesc: { fontSize: 13, lineHeight: 18, textAlign: "center", paddingHorizontal: 16 },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 12 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  section: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionTitle: { fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" as const },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  ownerAvatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  ownerAvatarText: { fontSize: 16 },
  ownerInfo: { flex: 1, gap: 2 },
  ownerName: { fontSize: 14 },
  ownerHandle: { fontSize: 12 },
  ownerBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  ownerBadgeText: { fontSize: 10 },
  membersList: { gap: 10 },
  memberCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 12, borderWidth: 1 },
  memberAvatar: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 14 },
  memberInfo: { flex: 1, gap: 3 },
  memberName: { fontSize: 13 },
  memberMeta: { fontSize: 11 },
  specRow: { flexDirection: "row", gap: 5, marginTop: 3, flexWrap: "wrap" as const },
  specChip: { paddingHorizontal: 6, paddingVertical: 2 },
  specChipText: { fontSize: 10 },
  emptyMembers: { padding: 16, alignItems: "center" },
  emptyMembersText: { fontSize: 13 },
  bottomBar: { borderTopWidth: 1, gap: 8 },
  ctaBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnText: { fontSize: 16 },
});

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import { TIER_COLORS } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!user) return null;

  const tierColor = TIER_COLORS[user.tier] ?? colors.mutedForeground;
  const repPct = Math.min((user.repScore ?? 0) / 100, 1);

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
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
          My Profile
        </Text>
        <TouchableOpacity onPress={() => router.push("/settings")} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="settings" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primaryDim, borderRadius: 40 }]}>
            <Text style={[styles.avatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {user.name[0]}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.name}
          </Text>
          <Text style={[styles.handle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user.handle}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
              <Text style={[styles.badgeText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {user.role === "stylist" ? "Artist / Stylist" : "Client"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: tierColor + "18", borderColor: tierColor + "40" }]}>
              <Text style={[styles.badgeText, { color: tierColor, fontFamily: "Inter_600SemiBold" }]}>
                {user.tier}
              </Text>
            </View>
            {user.verified && (
              <View style={[styles.badge, { backgroundColor: colors.green + "18", borderColor: colors.green + "40" }]}>
                <Feather name="check-circle" size={10} color={colors.green} />
                <Text style={[styles.badgeText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
                  Verified
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View
          style={[
            styles.statsRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          {[
            { label: "Jobs Done", value: String(user.jobsCount ?? 0), color: colors.primary },
            { label: "Rep Score", value: String(user.repScore ?? 0), color: colors.accent },
            { label: "Earned", value: `R${(user.earnings ?? 0).toLocaleString()}`, color: colors.green },
            { label: "Referrals", value: String(user.referrals ?? 0), color: colors.purple },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Reputation bar */}
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
            <Text style={[styles.repValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
              {user.repScore ?? 0}/100
            </Text>
          </View>
          <View style={[styles.repBarBg, { backgroundColor: colors.muted, borderRadius: 4 }]}>
            <View
              style={[
                styles.repBarFill,
                { width: `${repPct * 100}%`, backgroundColor: colors.accent, borderRadius: 4 },
              ]}
            />
          </View>
        </View>

        {/* About */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            About
          </Text>
          <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
            <Feather name="map-pin" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              {user.location || "Location not set"}
            </Text>
          </View>
          <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
            <Feather name="file-text" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: user.bio ? colors.foreground : colors.dim, fontFamily: "Inter_400Regular" }]}>
              {user.bio || "No bio added yet"}
            </Text>
          </View>
          {user.specialties && user.specialties.length > 0 && (
            <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
              <Feather name="star" size={15} color={colors.mutedForeground} />
              <View style={styles.specialtiesWrap}>
                {user.specialties.map((s) => (
                  <View
                    key={s}
                    style={[styles.specialtyChip, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "40", borderRadius: 6 }]}
                  >
                    <Text style={[styles.specialtyText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      {s}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Status */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Status
          </Text>
          <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
            <Feather
              name={user.available ? "check-circle" : "x-circle"}
              size={15}
              color={user.available ? colors.green : colors.dim}
            />
            <Text
              style={[
                styles.infoText,
                { color: user.available ? colors.green : colors.dim, fontFamily: "Inter_500Medium" },
              ]}
            >
              {user.available ? "Available for bookings" : "Not accepting bookings"}
            </Text>
          </View>
        </View>

        {/* Edit nudge */}
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          activeOpacity={0.82}
          style={[
            styles.editBtn,
            {
              backgroundColor: colors.primaryDim,
              borderColor: colors.primary + "40",
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="edit-2" size={15} color={colors.primary} />
          <Text style={[styles.editBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            Edit Profile in Settings
          </Text>
        </TouchableOpacity>
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 12 },
  heroCard: { alignItems: "center", padding: 24, gap: 6, borderWidth: 1 },
  avatar: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { fontSize: 36 },
  name: { fontSize: 20, letterSpacing: -0.5 },
  handle: { fontSize: 13 },
  badges: { flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" as const, justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderWidth: 1 },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 18, letterSpacing: -0.5 },
  statLabel: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.4 },
  statDivider: { width: 1, height: 32 },
  repCard: { padding: 16, gap: 10, borderWidth: 1 },
  repHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  repTitle: { fontSize: 14 },
  repValue: { fontSize: 16, letterSpacing: -0.3 },
  repBarBg: { height: 8, overflow: "hidden" },
  repBarFill: { height: 8 },
  section: { padding: 16, gap: 0, borderWidth: 1 },
  sectionTitle: { fontSize: 14, letterSpacing: -0.2, marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, borderTopWidth: 1 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  specialtiesWrap: { flex: 1, flexDirection: "row", flexWrap: "wrap" as const, gap: 6 },
  specialtyChip: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  specialtyText: { fontSize: 11 },
  editBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderWidth: 1 },
  editBtnText: { fontSize: 14 },
});

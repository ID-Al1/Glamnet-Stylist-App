import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { usePostings } from "@/context/PostingsContext";
import { useColors } from "@/hooks/useColors";

export default function CastingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { myPostings, totalApplicants, totalPending } = usePostings();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const shortlisted = myPostings.reduce(
    (sum, j) => sum + j.applicants.filter((a) => a.status === "shortlisted").length,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          My Castings
        </Text>
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); router.push("/post-job"); }}
          style={[styles.postBtn, { backgroundColor: colors.primary, borderRadius: 8 }]}
          activeOpacity={0.82}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={[styles.postBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {myPostings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryDim, borderRadius: 28 }]}>
              <Feather name="briefcase" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              No castings posted yet
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
            <View style={styles.statsRow}>
              {[
                { label: "Posted", value: String(myPostings.length), color: colors.purple },
                { label: "Applicants", value: String(totalApplicants), color: colors.primary },
                { label: "Pending", value: String(totalPending), color: colors.accent },
                { label: "Shortlisted", value: String(shortlisted), color: colors.green },
              ].map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.statCard,
                    { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                  ]}
                >
                  <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => { Haptics.selectionAsync(); router.push("/my-castings"); }}
              style={[
                styles.manageBtn,
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
              <Text style={[styles.manageBtnText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Manage All Castings
              </Text>
              {totalPending > 0 && (
                <View style={[styles.manageBadge, { backgroundColor: colors.accent, borderRadius: 8 }]}>
                  <Text style={[styles.manageBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    {totalPending} new
                  </Text>
                </View>
              )}
              <Feather name="arrow-right" size={14} color={colors.primary} style={{ marginLeft: "auto" as any }} />
            </TouchableOpacity>

            {myPostings.map((job) => {
              const pending = job.applicants.filter((a) => a.status === "pending").length;
              return (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => { Haptics.selectionAsync(); router.push(`/my-castings/${job.id}`); }}
                  activeOpacity={0.82}
                  style={[
                    styles.castingCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: pending > 0 ? colors.accent + "40" : colors.border,
                      borderRadius: colors.radius,
                      borderWidth: pending > 0 ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.castingRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.castingTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                        {job.title}
                      </Text>
                      <View style={styles.castingMeta}>
                        <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.castingMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {job.city}
                        </Text>
                        <Text style={{ color: colors.dim, fontSize: 11 }}>·</Text>
                        <Feather name="calendar" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.castingMetaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {job.date}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.castingRight}>
                      <Text
                        style={[
                          styles.applicantCount,
                          { color: pending > 0 ? colors.accent : colors.foreground, fontFamily: "Inter_700Bold" },
                        ]}
                      >
                        {job.applicants.length}
                      </Text>
                      <Text style={[styles.applicantLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {job.applicants.length !== 1 ? "applicants" : "applicant"}
                      </Text>
                      {pending > 0 && (
                        <View style={[styles.pendingBadge, { backgroundColor: colors.accentDim, borderRadius: 6 }]}>
                          <Text style={[styles.pendingText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                            {pending} new
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[styles.castingFooter, { borderTopColor: colors.border }]}>
                    <View style={[styles.typePill, { backgroundColor: colors.muted, borderRadius: 6 }]}>
                      <Text style={[styles.typeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {job.type}
                      </Text>
                    </View>
                    <Text style={[styles.castingRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                      {job.rate}
                    </Text>
                    <Feather name="chevron-right" size={14} color={colors.dim} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
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
  postBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8 },
  postBtnText: { fontSize: 14 },
  scroll: { padding: 16, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 14, paddingHorizontal: 24 },
  emptyIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, textAlign: "center", letterSpacing: -0.3 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 4,
  },
  emptyBtnText: { fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  statValue: { fontSize: 20, letterSpacing: -0.5 },
  statLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center" },
  manageBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  manageBtnText: { fontSize: 14 },
  manageBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  manageBadgeText: { fontSize: 10 },
  castingCard: { padding: 14, gap: 10 },
  castingRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  castingTitle: { fontSize: 15, letterSpacing: -0.2 },
  castingMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  castingMetaText: { fontSize: 11 },
  castingRight: { alignItems: "center", gap: 3 },
  applicantCount: { fontSize: 22, letterSpacing: -0.5 },
  applicantLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.3 },
  pendingBadge: { paddingHorizontal: 6, paddingVertical: 3 },
  pendingText: { fontSize: 9 },
  castingFooter: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 10, borderTopWidth: 1 },
  typePill: { paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: 11 },
  castingRate: { flex: 1, fontSize: 13, textAlign: "right" },
});

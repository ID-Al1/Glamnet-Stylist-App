import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { TEAM_ROLES, type Talent } from "@/constants/data";
import { useTalent } from "@/context/TalentContext";
import { useTeams } from "@/context/TeamsContext";
import { useColors } from "@/hooks/useColors";

const STEPS = ["Set Up", "Add Members", "Review"];

export default function TeamBuilderScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { talent } = useTalent();
  const { createTeam } = useTeams();
  const [step, setStep] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamRate, setTeamRate] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 16);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!teamName.trim()) e.teamName = "Team name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (step === 0 && !validateStep0()) return;
    if (step < 2) {
      Haptics.selectionAsync();
      setStep((s) => s + 1);
    } else {
      if (creating) return;
      setCreating(true);
      try {
        await createTeam({
          name: teamName,
          description: teamDesc || undefined,
          dayRate: teamRate ? Number(teamRate) : undefined,
          memberIds: selectedMembers,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setCreating(false);
      }
    }
  };

  const toggleMember = (id: string) => {
    Haptics.selectionAsync();
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredTalent =
    selectedRole === "all"
      ? talent
      : talent.filter((t) => {
          if (selectedRole === "model") return t.type === "model";
          return t.type === "artist" && t.artistCategory === selectedRole;
        });

  const selectedTalent = talent.filter((t) => selectedMembers.includes(t.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: i <= step ? colors.primary : colors.muted,
                    borderRadius: 12,
                  },
                ]}
              >
                {i < step ? (
                  <Feather name="check" size={11} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#fff" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: i === step ? colors.primary : colors.mutedForeground,
                    fontFamily: i === step ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ width: 30 }} />
      </View>

      {/* Step 0: Setup */}
      {step === 0 && (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: paddingBottom + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.stepHeader}>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
              Name your team
            </Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Give your creative team an identity
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Team Name *
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    borderColor: errors.teamName ? colors.destructive : colors.border,
                    backgroundColor: colors.card,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <TextInput
                  value={teamName}
                  onChangeText={setTeamName}
                  placeholder="e.g. Editorial Collective"
                  placeholderTextColor={colors.dim}
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                />
              </View>
              {errors.teamName && (
                <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                  {errors.teamName}
                </Text>
              )}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Description
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius, height: 80, alignItems: "flex-start", paddingTop: 12 },
                ]}
              >
                <TextInput
                  value={teamDesc}
                  onChangeText={setTeamDesc}
                  placeholder="What kind of work does this team do?"
                  placeholderTextColor={colors.dim}
                  multiline
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular", textAlignVertical: "top" }]}
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Team Day Rate
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius },
                ]}
              >
                <Text style={[styles.ratePrefix, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  R
                </Text>
                <TextInput
                  value={teamRate}
                  onChangeText={setTeamRate}
                  placeholder="0"
                  placeholderTextColor={colors.dim}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                />
              </View>
            </View>

            {/* Role chips */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Team Roles
              </Text>
              <View style={styles.rolesGrid}>
                {TEAM_ROLES.map((r) => (
                  <View
                    key={r.role}
                    style={[
                      styles.roleChip,
                      {
                        backgroundColor: colors.muted,
                        borderRadius: colors.radius - 4,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text style={[styles.roleChipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {r.role}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Step 1: Add Members */}
      {step === 1 && (
        <View style={{ flex: 1 }}>
          {/* Role filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.roleFilter, { borderBottomColor: colors.border }]}
          >
            {[
              { id: "all", label: "All" },
              { id: "model", label: "Models" },
              { id: "makeup", label: "MUA" },
              { id: "hair", label: "Hair" },
              { id: "nails", label: "Nails" },
              { id: "lash", label: "Lash" },
              { id: "photographer", label: "Photo" },
            ].map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => { Haptics.selectionAsync(); setSelectedRole(r.id); }}
                style={[
                  styles.roleFilterChip,
                  {
                    backgroundColor: selectedRole === r.id ? colors.primary : "transparent",
                    borderRadius: 8,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.roleFilterText,
                    {
                      color: selectedRole === r.id ? "#fff" : colors.mutedForeground,
                      fontFamily: selectedRole === r.id ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedMembers.length > 0 && (
            <View style={[styles.selectedBar, { backgroundColor: colors.primaryDim, borderBottomColor: colors.border }]}>
              <Text style={[styles.selectedBarText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
              </Text>
            </View>
          )}

          <FlatList
            data={filteredTalent}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: Talent }) => (
              <View style={{ position: "relative" }}>
                <TalentCard
                  talent={item}
                  onPress={() => toggleMember(item.id)}
                  compact
                />
                {selectedMembers.includes(item.id) && (
                  <View
                    style={[
                      styles.selectedOverlay,
                      {
                        borderColor: colors.primary,
                        borderRadius: colors.radius,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <View style={[styles.selectedCheck, { backgroundColor: colors.primary }]}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  </View>
                )}
              </View>
            )}
            contentContainerStyle={[
              styles.memberList,
              { paddingBottom: paddingBottom + 80 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: paddingBottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepHeader}>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
              Review your team
            </Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Everything look good?
            </Text>
          </View>

          <View
            style={[
              styles.reviewCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius + 4,
              },
            ]}
          >
            <Text style={[styles.reviewName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {teamName || "Untitled Team"}
            </Text>
            {teamDesc ? (
              <Text style={[styles.reviewDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {teamDesc}
              </Text>
            ) : null}
            {teamRate ? (
              <Text style={[styles.reviewRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                R{teamRate}/day
              </Text>
            ) : null}
          </View>

          <Text style={[styles.memberSectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Members ({selectedMembers.length})
          </Text>

          {selectedTalent.length === 0 ? (
            <Text style={[styles.noMembers, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No members added. Go back to add talent.
            </Text>
          ) : (
            selectedTalent.map((t) => (
              <TalentCard key={t.id} talent={t} onPress={() => {}} compact />
            ))
          )}
        </ScrollView>
      )}

      {/* Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: paddingBottom + 8,
            paddingHorizontal: 20,
            paddingTop: 16,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: creating ? colors.primaryDim : colors.primary, borderRadius: colors.radius },
          ]}
          onPress={handleNext}
          activeOpacity={0.82}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={[styles.nextBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {step < 2 ? "Continue" : "Create Team"}
              </Text>
              {step < 2 && <Feather name="arrow-right" size={18} color="#fff" />}
              {step === 2 && <Feather name="check" size={18} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  stepRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 11 },
  stepLabel: { fontSize: 10 },
  scrollContent: { padding: 24, gap: 20 },
  stepHeader: { gap: 6 },
  stepTitle: { fontSize: 24, letterSpacing: -0.6 },
  stepSub: { fontSize: 13 },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 15 },
  ratePrefix: { fontSize: 16 },
  errorText: { fontSize: 12 },
  rolesGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 7 },
  roleChipText: { fontSize: 12 },
  roleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    borderBottomWidth: 1,
  },
  roleFilterChip: { paddingHorizontal: 14, paddingVertical: 8 },
  roleFilterText: { fontSize: 13 },
  selectedBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  selectedBarText: { fontSize: 13 },
  memberList: { paddingHorizontal: 16, paddingTop: 12 },
  selectedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 10,
    borderWidth: 2,
    pointerEvents: "none",
  },
  selectedCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCard: { padding: 20, borderWidth: 1, gap: 8 },
  reviewName: { fontSize: 20, letterSpacing: -0.4 },
  reviewDesc: { fontSize: 13, lineHeight: 18 },
  reviewRate: { fontSize: 18, letterSpacing: -0.3 },
  memberSectionTitle: { fontSize: 15, letterSpacing: -0.3, marginTop: 8 },
  noMembers: { fontSize: 13, textAlign: "center", paddingVertical: 20 },
  bottomBar: { borderTopWidth: 1 },
  nextBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { fontSize: 16, letterSpacing: -0.2 },
});

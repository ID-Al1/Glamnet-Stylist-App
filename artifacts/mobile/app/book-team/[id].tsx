import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useBookings } from "@/context/BookingContext";
import { apiFetch } from "@/lib/api";
import { DateTimeInput } from "@/components/DateTimeInput";
import { LocationInput } from "@/components/LocationInput";

interface TeamDetail {
  id: string;
  name: string;
  description: string | null;
  dayRate: number | null;
  isPublic: boolean;
  memberCount: number;
  members: { id: string; name: string; handle: string | null; avatarUrl: string | null }[];
  ownerName: string;
  ownerHandle: string;
  ownerId: string;
}

const JOB_TYPES = ["Bridal", "Editorial", "Events", "Commercial", "TV/Film", "Fashion Week", "Campaign", "Other"];
const STEPS = ["Service", "Details", "Confirm"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function BookTeamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { createBooking } = useBookings();

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [step, setStep] = useState(0);
  const [jobType, setJobType] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booked, setBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 16);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  const formattedDate = selectedDateTime
    ? selectedDateTime.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) +
      " at " +
      selectedDateTime.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";

  useEffect(() => {
    apiFetch<{ team: TeamDetail }>(`/teams/${id}`)
      .then(({ team: t }) => setTeam(t))
      .catch(() => {})
      .finally(() => setLoadingTeam(false));
  }, [id]);

  if (loadingTeam) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Team not found</Text>
      </View>
    );
  }

  const totalCost = team.dayRate ?? 0;

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !jobType) e.jobType = "Please select a service type";
    if (step === 1) {
      if (!selectedDateTime) e.date = "Date & time is required";
      if (!location.trim()) e.location = "Location is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < 2) {
      Haptics.selectionAsync();
      setStep((s) => s + 1);
    } else {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setErrors({});
      try {
        await createBooking({
          talentId: team.ownerId,
          teamId: team.id,
          jobType,
          date: formattedDate,
          location,
          notes,
          totalCost,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setBooked(true);
      } catch {
        setErrors({ submit: "Failed to send booking. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (booked) {
    return (
      <View style={[styles.container, styles.successWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.greenDim, borderRadius: 48 }]}>
          <Feather name="check-circle" size={52} color={colors.green} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
          Team Hired!
        </Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your booking request for{" "}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{team.name}</Text> on{" "}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{formattedDate}</Text> has been sent to{" "}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>@{team.ownerHandle}</Text>.
        </Text>
        <View style={[styles.successCard, { backgroundColor: colors.warm, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1 }]}>
          {[
            { label: "Team", value: team.name },
            { label: "Service", value: jobType },
            { label: "Date", value: formattedDate },
            { label: "Location", value: location },
            { label: "Members", value: `${team.memberCount} professional${team.memberCount !== 1 ? "s" : ""}` },
            ...(totalCost > 0 ? [{ label: "Day Rate", value: `R${totalCost.toLocaleString()}` }] : []),
          ].map((row) => (
            <View key={row.label} style={styles.successRow}>
              <Text style={[styles.successLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {row.label}
              </Text>
              <Text style={[styles.successValue, { color: row.label === "Day Rate" ? colors.accent : colors.foreground, fontFamily: row.label === "Day Rate" ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.82}
        >
          <Text style={[styles.doneBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            Back to Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifLink}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.75}
        >
          <Feather name="bell" size={14} color={colors.primary} />
          <Text style={[styles.notifLinkText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
            View notifications
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop,
            paddingHorizontal: 16,
            paddingBottom: 12,
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
                    backgroundColor: i < step ? colors.green : i === step ? colors.primary : colors.muted,
                    borderRadius: 11,
                  },
                ]}
              >
                {i < step ? (
                  <Feather name="check" size={11} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i === step ? "#fff" : colors.dim, fontFamily: "Inter_600SemiBold" }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: i === step ? colors.primary : i < step ? colors.green : colors.dim,
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

      {/* Team mini-bar */}
      <View style={[styles.teamBar, { backgroundColor: colors.warm, borderBottomColor: colors.border }]}>
        <View style={[styles.teamBarIcon, { backgroundColor: colors.primaryDim, borderRadius: 10 }]}>
          <Feather name="users" size={18} color={colors.primary} />
        </View>
        <View style={styles.teamBarInfo}>
          <Text style={[styles.teamBarName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {team.name}
          </Text>
          <Text style={[styles.teamBarSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {team.memberCount} member{team.memberCount !== 1 ? "s" : ""} · @{team.ownerHandle}
          </Text>
        </View>
        {team.dayRate ? (
          <Text style={[styles.teamBarRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            R{team.dayRate.toLocaleString()}/day
          </Text>
        ) : null}
      </View>

      {/* Member avatars strip */}
      {team.members.length > 0 && (
        <View style={[styles.avatarStrip, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={styles.avatarRow}>
            {team.members.slice(0, 5).map((m, i) => (
              <View
                key={m.id}
                style={[
                  styles.avatarThumb,
                  {
                    backgroundColor: colors.muted,
                    borderColor: colors.background,
                    borderRadius: 15,
                    marginLeft: i > 0 ? -6 : 0,
                  },
                ]}
              >
                <Text style={[styles.avatarThumbText, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  {initials(m.name)}
                </Text>
              </View>
            ))}
            {team.memberCount > 5 && (
              <Text style={[styles.avatarMore, { color: colors.dim, fontFamily: "Inter_400Regular" }]}>
                +{team.memberCount - 5}
              </Text>
            )}
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Service Type */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
                What's the campaign?
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Select the type of work for this team
              </Text>
            </View>
            <View style={styles.jobTypeGrid}>
              {JOB_TYPES.map((jt) => (
                <TouchableOpacity
                  key={jt}
                  onPress={() => { Haptics.selectionAsync(); setJobType(jt); }}
                  activeOpacity={0.8}
                  style={[
                    styles.jobTypeCard,
                    {
                      borderColor: jobType === jt ? colors.primary : colors.border,
                      backgroundColor: jobType === jt ? colors.primaryDim : colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.jobTypeText,
                      {
                        color: jobType === jt ? colors.primary : colors.foreground,
                        fontFamily: jobType === jt ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {jt}
                  </Text>
                  {jobType === jt && <Feather name="check" size={12} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
            {errors.jobType && (
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                {errors.jobType}
              </Text>
            )}
          </View>
        )}

        {/* Step 1: Date & Location */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
                Date & location
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                When and where does the team need to be?
              </Text>
            </View>
            <View style={styles.form}>
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Date & Time *
                </Text>
                <DateTimeInput
                  value={selectedDateTime}
                  onChange={setSelectedDateTime}
                  error={errors.date}
                />
                {errors.date && (
                  <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                    {errors.date}
                  </Text>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Location / Venue *
                </Text>
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  error={errors.location}
                  placeholder="Studio / set address"
                />
                {errors.location && (
                  <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                    {errors.location}
                  </Text>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Brief / Notes
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius,
                      height: 88,
                      alignItems: "flex-start",
                      paddingTop: 12,
                    },
                  ]}
                >
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Campaign brief, mood board references, dress code..."
                    placeholderTextColor={colors.dim}
                    multiline
                    style={[
                      styles.inputText,
                      {
                        flex: 1,
                        color: colors.foreground,
                        fontFamily: "Inter_400Regular",
                        textAlignVertical: "top",
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Confirm */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
                Confirm & hire
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Review the details before sending to {team.ownerName.split(" ")[0]}
              </Text>
            </View>

            {/* Booking summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius + 4 }]}>
              {[
                { label: "Team", value: team.name },
                { label: "Service", value: jobType },
                { label: "Date", value: formattedDate },
                { label: "Location", value: location },
                { label: "Members", value: `${team.memberCount} professional${team.memberCount !== 1 ? "s" : ""}` },
              ].map((row) => (
                <View key={row.label} style={[styles.reviewRow, { borderBottomColor: colors.borderLight ?? colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {row.value}
                  </Text>
                </View>
              ))}
              {notes ? (
                <View style={[styles.reviewRow, { borderBottomColor: "transparent" }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Brief
                  </Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}>
                    {notes}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Cost */}
            {totalCost > 0 && (
              <View style={[styles.costCard, { backgroundColor: colors.accentDim, borderColor: colors.accent + "30", borderRadius: colors.radius }]}>
                <Text style={[styles.costTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Team Day Rate
                </Text>
                <View style={styles.costRow}>
                  <Text style={[styles.costLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                  </Text>
                  <Text style={[styles.costValue, { color: colors.accent, fontFamily: "Inter_700Bold", fontSize: 20 }]}>
                    R{totalCost.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Confirm card */}
            <View style={[styles.confirmCard, { backgroundColor: colors.primaryDim, borderColor: colors.primary + "40", borderRadius: colors.radius + 4 }]}>
              <View style={[styles.confirmIconWrap, { backgroundColor: colors.primary, borderRadius: 20 }]}>
                <Feather name="briefcase" size={22} color="#fff" />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Hire {team.name}
              </Text>
              <Text style={[styles.confirmSub, { color: colors.primaryDeep, fontFamily: "Inter_400Regular" }]}>
                By confirming, your request will be sent to the team lead. Payment is processed only once the team accepts.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

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
        {errors.submit && (
          <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 8 }]}>
            {errors.submit}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: isSubmitting ? colors.muted : colors.primary, borderRadius: colors.radius }]}
          onPress={handleNext}
          activeOpacity={0.82}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={[styles.nextBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {step === 2 ? "Confirm & Hire Team" : "Continue"}
              </Text>
              <Feather name={step === 2 ? "check" : "arrow-right"} size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successWrap: { justifyContent: "center", alignItems: "center", padding: 28, gap: 16 },
  successIcon: { width: 96, height: 96, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 24, letterSpacing: -0.6, textAlign: "center" },
  successSub: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  successCard: { width: "100%", padding: 16, gap: 10 },
  successRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  successLabel: { fontSize: 12 },
  successValue: { fontSize: 14 },
  doneBtn: { width: "100%", height: 52, alignItems: "center", justifyContent: "center", marginTop: 8 },
  doneBtnText: { fontSize: 16 },
  notifLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifLinkText: { fontSize: 13 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  stepRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  stepItem: { alignItems: "center", gap: 3 },
  stepCircle: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 10 },
  stepLabel: { fontSize: 9 },
  teamBar: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1 },
  teamBarIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  teamBarInfo: { flex: 1, gap: 2 },
  teamBarName: { fontSize: 14 },
  teamBarSub: { fontSize: 11 },
  teamBarRate: { fontSize: 13 },
  avatarStrip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarThumb: { width: 30, height: 30, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  avatarThumbText: { fontSize: 10 },
  avatarMore: { fontSize: 11, marginLeft: 8 },
  scroll: { padding: 20, gap: 16 },
  stepContent: { gap: 20 },
  stepHeader: { gap: 6 },
  stepTitle: { fontSize: 22, letterSpacing: -0.5 },
  stepSub: { fontSize: 13 },
  jobTypeGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  jobTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
  },
  jobTypeText: { fontSize: 14 },
  errorText: { fontSize: 12 },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  inputText: { fontSize: 15 },
  dateOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  dateSheet: { paddingBottom: 32, overflow: "hidden" },
  dateSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  datePickerBtn: { fontSize: 15 },
  datePickerTitle: { fontSize: 15 },
  reviewCard: { borderWidth: 1, overflow: "hidden" },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  reviewLabel: { fontSize: 12, flex: 1 },
  reviewValue: { fontSize: 13, textAlign: "right" as const, flex: 2 },
  costCard: { padding: 16, borderWidth: 1, gap: 8 },
  costTitle: { fontSize: 13 },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costLabel: { fontSize: 13 },
  costValue: { fontSize: 14 },
  confirmCard: { padding: 24, borderWidth: 1, alignItems: "center", gap: 12 },
  confirmIconWrap: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  confirmTitle: { fontSize: 18, textAlign: "center" },
  confirmSub: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  bottomBar: { borderTopWidth: 1 },
  nextBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { fontSize: 16 },
});

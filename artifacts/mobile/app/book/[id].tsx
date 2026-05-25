import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ALL_TALENT } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/context/NotificationsContext";

const JOB_TYPES = ["Bridal", "Editorial", "Events", "Commercial", "TV/Film", "Fashion Week", "Personal", "Other"];

const STEPS = ["Service", "Details", "Review", "Confirm"];

export default function BookScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notifications } = useNotifications();

  const talent = ALL_TALENT.find((t) => t.id === id);

  const [step, setStep] = useState(0);
  const [jobType, setJobType] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isHouseCall, setIsHouseCall] = useState(false);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booked, setBooked] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 16);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  if (!talent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Talent not found</Text>
      </View>
    );
  }

  const callOutCost =
    isHouseCall && talent.settings.callOutFee
      ? talent.settings.callOutBase + talent.settings.callOutRate * 10
      : 0;
  const totalCost = talent.rateNum + callOutCost;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !jobType) e.jobType = "Please select a service type";
    if (step === 1) {
      if (!date.trim()) e.date = "Date is required";
      if (!location.trim()) e.location = "Location is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < 3) {
      Haptics.selectionAsync();
      setStep((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.greenDim, borderRadius: 40 }]}>
          <Feather name="check-circle" size={52} color={colors.green} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Booking Requested!
        </Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your booking request for{" "}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{talent.name}</Text> on{" "}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{date}</Text> has been sent.
          {"\n\n"}You'll receive a confirmation notification once accepted.
        </Text>
        <View style={[styles.successCard, { backgroundColor: colors.warm, borderRadius: colors.radius, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.successRow}>
            <Text style={[styles.successLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Artist</Text>
            <Text style={[styles.successValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{talent.name}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={[styles.successLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Service</Text>
            <Text style={[styles.successValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{jobType}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={[styles.successLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Date</Text>
            <Text style={[styles.successValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{date}</Text>
          </View>
          <View style={styles.successRow}>
            <Text style={[styles.successLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total</Text>
            <Text style={[styles.successValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>R{totalCost.toLocaleString()}</Text>
          </View>
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

        {/* Step indicators */}
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

      {/* Artist mini-card */}
      <View
        style={[
          styles.artistBar,
          {
            backgroundColor: colors.warm,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.artistAvatar,
            {
              backgroundColor: talent.type === "model" ? colors.purpleDim : colors.primaryDim,
              borderRadius: 10,
            },
          ]}
        >
          <Text style={[styles.artistAvatarText, { color: talent.type === "model" ? colors.purple : colors.primary, fontFamily: "Inter_700Bold" }]}>
            {talent.type === "model" ? "✦" : talent.name[0]}
          </Text>
        </View>
        <View style={styles.artistInfo}>
          <Text style={[styles.artistName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {talent.name}
          </Text>
          <Text style={[styles.artistRole, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {talent.role} · {talent.location}
          </Text>
        </View>
        <View style={styles.artistRate}>
          <Text style={[styles.artistRateText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {talent.rate}
          </Text>
          {talent.settings.instantBook && (
            <View style={[styles.instantBadge, { backgroundColor: colors.greenDim, borderRadius: 5 }]}>
              <Feather name="zap" size={9} color={colors.green} />
              <Text style={[styles.instantText, { color: colors.green, fontFamily: "Inter_600SemiBold" }]}>
                Instant
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 0: Service Type */}
        {step === 0 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                What's the occasion?
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Select the type of booking
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

            {/* House calls */}
            {talent.settings.houseCallsEnabled && (
              <View
                style={[
                  styles.houseCallCard,
                  {
                    backgroundColor: isHouseCall ? colors.greenDim : colors.card,
                    borderColor: isHouseCall ? colors.green + "40" : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={styles.houseCallInfo}>
                  <Feather name="home" size={16} color={isHouseCall ? colors.green : colors.mutedForeground} />
                  <View style={styles.houseCallText}>
                    <Text style={[styles.houseCallTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      House Call Available
                    </Text>
                    <Text style={[styles.houseCallSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      +R{talent.settings.callOutBase} base + R{talent.settings.callOutRate}/km
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => { Haptics.selectionAsync(); setIsHouseCall((v) => !v); }}
                  style={[
                    styles.toggle,
                    { backgroundColor: isHouseCall ? colors.green : colors.muted },
                  ]}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: "#fff",
                        transform: [{ translateX: isHouseCall ? 20 : 2 }],
                      },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Step 1: Date & Location */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Date & location
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                When and where do you need {talent.name.split(" ")[0]}?
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Date *
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: errors.date ? colors.destructive : colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Feather name="calendar" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="e.g. June 8, 2026"
                    placeholderTextColor={colors.dim}
                    style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  />
                </View>
                {errors.date && (
                  <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                    {errors.date}
                  </Text>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Location *
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: errors.location ? colors.destructive : colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Feather name="map-pin" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={location}
                    onChangeText={setLocation}
                    placeholder={isHouseCall ? "Your address" : "Studio / venue address"}
                    placeholderTextColor={colors.dim}
                    style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  />
                </View>
                {errors.location && (
                  <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                    {errors.location}
                  </Text>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Additional Notes
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
                    placeholder="Mood board, references, skin tone notes..."
                    placeholderTextColor={colors.dim}
                    multiline
                    style={[
                      styles.input,
                      {
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

        {/* Step 2: Review */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Review booking
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Check the details before confirming
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
              {[
                { label: "Artist", value: `${talent.name} (${talent.role})` },
                { label: "Service", value: jobType },
                { label: "Date", value: date },
                { label: "Location", value: location },
                { label: "Booking type", value: isHouseCall ? "House Call" : "Studio / Venue" },
              ].map((row) => (
                <View key={row.label} style={[styles.reviewRow, { borderBottomColor: colors.borderLight }]}>
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
                    Notes
                  </Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}>
                    {notes}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Cost breakdown */}
            <View
              style={[
                styles.costCard,
                {
                  backgroundColor: colors.accentDim,
                  borderColor: colors.accent + "30",
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text style={[styles.costTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Cost Breakdown
              </Text>
              <View style={[styles.costRow, { borderBottomColor: colors.accent + "20" }]}>
                <Text style={[styles.costLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Day rate
                </Text>
                <Text style={[styles.costValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  R{talent.rateNum.toLocaleString()}
                </Text>
              </View>
              {isHouseCall && callOutCost > 0 && (
                <View style={[styles.costRow, { borderBottomColor: colors.accent + "20" }]}>
                  <Text style={[styles.costLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    House call fee
                  </Text>
                  <Text style={[styles.costValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    R{callOutCost.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  Total
                </Text>
                <Text style={[styles.costValue, { color: colors.accent, fontFamily: "Inter_700Bold", fontSize: 18 }]}>
                  R{totalCost.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Verification info */}
            <View
              style={[
                styles.verifyCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text style={[styles.verifyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Artist Verification
              </Text>
              <View style={styles.verifyGrid}>
                {[
                  { label: "Identity", checked: talent.verification.identity },
                  { label: "Portfolio", checked: talent.verification.portfolio },
                  { label: "First Appt", checked: talent.verification.firstAppointment },
                  { label: "Skills", checked: talent.verification.skillAssessment },
                ].map((v) => (
                  <View key={v.label} style={styles.verifyItem}>
                    <Feather
                      name={v.checked ? "check-circle" : "circle"}
                      size={14}
                      color={v.checked ? colors.green : colors.dim}
                    />
                    <Text
                      style={[
                        styles.verifyLabel,
                        {
                          color: v.checked ? colors.foreground : colors.mutedForeground,
                          fontFamily: "Inter_400Regular",
                        },
                      ]}
                    >
                      {v.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Confirm & send
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Your booking request will be sent to {talent.name.split(" ")[0]}
              </Text>
            </View>

            <View
              style={[
                styles.confirmCard,
                {
                  backgroundColor: colors.primaryDim,
                  borderColor: colors.primary + "40",
                  borderRadius: colors.radius + 4,
                },
              ]}
            >
              <View style={[styles.confirmIconWrap, { backgroundColor: colors.primary, borderRadius: 20 }]}>
                <Feather name="send" size={22} color="#fff" />
              </View>
              <Text style={[styles.confirmTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                Ready to book {talent.name.split(" ")[0]}
              </Text>
              <Text style={[styles.confirmSub, { color: colors.primaryDeep, fontFamily: "Inter_400Regular" }]}>
                By confirming, you agree to GlamNet's booking terms. Payment will only be processed once the artist accepts.
              </Text>
              <View style={[styles.confirmSummary, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
                <Text style={[styles.confirmSummaryText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {jobType} · {date}
                </Text>
                <Text style={[styles.confirmSummaryRate, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  R{totalCost.toLocaleString()} total
                </Text>
              </View>
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
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={handleNext}
          activeOpacity={0.82}
        >
          <Text style={[styles.nextBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {step === 3 ? "Confirm Booking" : "Continue"}
          </Text>
          <Feather name={step === 3 ? "check" : "arrow-right"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { textAlign: "center", marginTop: 40, fontSize: 16 },
  successContainer: { justifyContent: "center", alignItems: "center", padding: 28, gap: 16 },
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
  stepRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  stepItem: { alignItems: "center", gap: 3 },
  stepCircle: { width: 22, height: 22, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 10 },
  stepLabel: { fontSize: 9 },
  artistBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  artistAvatar: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  artistAvatarText: { fontSize: 18 },
  artistInfo: { flex: 1, gap: 2 },
  artistName: { fontSize: 14 },
  artistRole: { fontSize: 11 },
  artistRate: { alignItems: "flex-end", gap: 3 },
  artistRateText: { fontSize: 13 },
  instantBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2 },
  instantText: { fontSize: 9 },
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
  houseCallCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  houseCallInfo: { flex: 1, flexDirection: "row", gap: 10, alignItems: "center" },
  houseCallText: { gap: 2 },
  houseCallTitle: { fontSize: 14 },
  houseCallSub: { fontSize: 11 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    position: "relative",
  },
  toggleThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
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
  input: { flex: 1, fontSize: 15 },
  errorText: { fontSize: 12 },
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
  costCard: { padding: 16, borderWidth: 1, gap: 2 },
  costTitle: { fontSize: 14, marginBottom: 8 },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  costLabel: { fontSize: 13 },
  costValue: { fontSize: 14 },
  verifyCard: { padding: 14, borderWidth: 1, gap: 10 },
  verifyTitle: { fontSize: 13 },
  verifyGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  verifyItem: { flexDirection: "row", alignItems: "center", gap: 5, width: "45%" as any },
  verifyLabel: { fontSize: 12 },
  confirmCard: { padding: 24, borderWidth: 1, alignItems: "center", gap: 12 },
  confirmIconWrap: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  confirmTitle: { fontSize: 18, textAlign: "center" },
  confirmSub: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  confirmSummary: { width: "100%", padding: 14, alignItems: "center", gap: 4 },
  confirmSummaryText: { fontSize: 14 },
  confirmSummaryRate: { fontSize: 18, letterSpacing: -0.4 },
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

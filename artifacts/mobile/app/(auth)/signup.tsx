import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import { useAuth, type UserRole } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const STYLIST_SPECIALTIES = [
  "Makeup Artist",
  "Hair Stylist",
  "Nail Technician",
  "Lash Tech",
  "Photographer",
  "Model",
  "Wardrobe Stylist",
  "Body Art",
];

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 16);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      Haptics.selectionAsync();
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) {
        Haptics.selectionAsync();
        if (role === "stylist") {
          setStep(3);
        } else {
          handleSubmit();
        }
      }
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await signUp({
        name,
        email,
        password,
        role,
        location,
        specialties: role === "stylist" ? selectedSpecialties : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (s: string) => {
    Haptics.selectionAsync();
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop,
            paddingHorizontal: 20,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as 1 | 2 | 3))}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.stepIndicator}>
          {[1, 2, ...(role === "stylist" ? [3] : [])].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                {
                  backgroundColor: step >= s ? colors.primary : colors.border,
                  width: step === s ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: paddingBottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Join GlamNet
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                How will you use GlamNet?
              </Text>
            </View>

            <View style={styles.roleCards}>
              {/* Client */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    borderColor: role === "client" ? colors.primary : colors.border,
                    backgroundColor: role === "client" ? colors.primaryDim : colors.card,
                    borderRadius: colors.radius + 4,
                  },
                ]}
                onPress={() => { Haptics.selectionAsync(); setRole("client"); }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIconWrap,
                    {
                      backgroundColor: role === "client" ? colors.primary : colors.muted,
                      borderRadius: 14,
                    },
                  ]}
                >
                  <Feather name="briefcase" size={26} color={role === "client" ? "#fff" : colors.mutedForeground} />
                </View>
                <Text style={[styles.roleCardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Client
                </Text>
                <Text style={[styles.roleCardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Hire models & artists for campaigns, events, and productions.
                </Text>
                <View style={styles.roleFeatures}>
                  {["Browse talent", "Build teams", "Post jobs", "Track campaigns"].map((f) => (
                    <View key={f} style={styles.roleFeature}>
                      <Feather name="check" size={12} color={colors.green} />
                      <Text style={[styles.roleFeatureText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
                {role === "client" && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Stylist */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    borderColor: role === "stylist" ? colors.purple : colors.border,
                    backgroundColor: role === "stylist" ? colors.purpleDim : colors.card,
                    borderRadius: colors.radius + 4,
                  },
                ]}
                onPress={() => { Haptics.selectionAsync(); setRole("stylist"); }}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.roleIconWrap,
                    {
                      backgroundColor: role === "stylist" ? colors.purple : colors.muted,
                      borderRadius: 14,
                    },
                  ]}
                >
                  <Feather name="scissors" size={26} color={role === "stylist" ? "#fff" : colors.mutedForeground} />
                </View>
                <Text style={[styles.roleCardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Creative Professional
                </Text>
                <Text style={[styles.roleCardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Showcase your talent, get booked, and grow your career.
                </Text>
                <View style={styles.roleFeatures}>
                  {["Create profile", "Get discovered", "Join teams", "Earn & grow"].map((f) => (
                    <View key={f} style={styles.roleFeature}>
                      <Feather name="check" size={12} color={colors.green} />
                      <Text style={[styles.roleFeatureText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
                {role === "stylist" && (
                  <View style={[styles.selectedBadge, { backgroundColor: colors.purple }]}>
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Create account
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {role === "stylist" ? "Set up your creative profile" : "Your account details"}
              </Text>
            </View>

            <View style={styles.form}>
              {[
                { key: "name", label: "Full Name", placeholder: "Your name", value: name, set: setName, icon: "user" as const, keyboard: "default" as const },
                { key: "email", label: "Email Address", placeholder: "your@email.com", value: email, set: setEmail, icon: "mail" as const, keyboard: "email-address" as const },
                { key: "location", label: "Location", placeholder: "e.g. Johannesburg", value: location, set: setLocation, icon: "map-pin" as const, keyboard: "default" as const },
              ].map((field) => (
                <View key={field.key} style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {field.label}
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      {
                        borderColor: errors[field.key] ? colors.destructive : colors.border,
                        backgroundColor: colors.card,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <Feather name={field.icon} size={16} color={colors.mutedForeground} />
                    <TextInput
                      value={field.value}
                      onChangeText={field.set}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.dim}
                      keyboardType={field.keyboard}
                      autoCapitalize={field.key === "email" ? "none" : "words"}
                      style={[
                        styles.input,
                        { color: colors.foreground, fontFamily: "Inter_400Regular" },
                      ]}
                    />
                  </View>
                  {errors[field.key] && (
                    <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                      {errors[field.key]}
                    </Text>
                  )}
                </View>
              ))}

              {/* Password */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Password
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      borderColor: errors.password ? colors.destructive : colors.border,
                      backgroundColor: colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 6 characters"
                    placeholderTextColor={colors.dim}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                    {errors.password}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Stylist Specialties */}
        {step === 3 && role === "stylist" && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Your specialties
              </Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Select all that apply — clients will find you by these.
              </Text>
            </View>

            <View style={styles.specialtyGrid}>
              {STYLIST_SPECIALTIES.map((s) => {
                const selected = selectedSpecialties.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => toggleSpecialty(s)}
                    activeOpacity={0.75}
                    style={[
                      styles.specialtyChip,
                      {
                        borderColor: selected ? colors.purple : colors.border,
                        backgroundColor: selected ? colors.purpleDim : colors.card,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.specialtyText,
                        {
                          color: selected ? colors.purple : colors.foreground,
                          fontFamily: selected ? "Inter_600SemiBold" : "Inter_400Regular",
                        },
                      ]}
                    >
                      {s}
                    </Text>
                    {selected && <Feather name="check" size={12} color={colors.purple} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {errors.submit && (
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular", textAlign: "center" }]}>
                {errors.submit}
              </Text>
            )}
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
          style={[
            styles.nextBtn,
            {
              backgroundColor: loading ? colors.primaryDim : colors.primary,
              borderRadius: colors.radius,
            },
          ]}
          onPress={handleNext}
          activeOpacity={0.82}
          disabled={loading}
        >
          <Text style={[styles.nextBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {step === 1 ? "Continue" : step === 2 && role === "stylist" ? "Next" : loading ? "Creating..." : "Create Account"}
          </Text>
          {!loading && <Feather name="arrow-right" size={18} color="#fff" />}
        </TouchableOpacity>

        {step === 1 && (
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signin")}
            style={styles.signInLink}
            activeOpacity={0.7}
          >
            <Text style={[styles.signInLinkText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Already have an account?{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  stepIndicator: { flexDirection: "row", gap: 6, alignItems: "center" },
  stepDot: { height: 8, borderRadius: 4 },
  scrollContent: { padding: 24 },
  stepContent: { gap: 24 },
  stepHeader: { gap: 6 },
  stepTitle: { fontSize: 26, letterSpacing: -0.6, lineHeight: 32 },
  stepSub: { fontSize: 14, lineHeight: 20 },
  roleCards: { gap: 14 },
  roleCard: {
    borderWidth: 1.5,
    padding: 20,
    gap: 10,
    position: "relative",
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  roleCardTitle: { fontSize: 18, letterSpacing: -0.3 },
  roleCardDesc: { fontSize: 13, lineHeight: 18 },
  roleFeatures: { gap: 6, marginTop: 4 },
  roleFeature: { flexDirection: "row", alignItems: "center", gap: 8 },
  roleFeatureText: { fontSize: 13 },
  selectedBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
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
  specialtyGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  specialtyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  specialtyText: { fontSize: 14 },
  bottomBar: { borderTopWidth: 1, gap: 12 },
  nextBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextBtnText: { fontSize: 16, letterSpacing: -0.2 },
  signInLink: { alignItems: "center", paddingVertical: 4 },
  signInLinkText: { fontSize: 14 },
});

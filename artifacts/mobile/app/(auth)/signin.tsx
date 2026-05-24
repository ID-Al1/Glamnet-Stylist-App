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

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 16);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 16);

  const handleSignIn = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setError("Sign in failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
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
            paddingBottom: 16,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
          <Text style={[styles.logoMarkText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>G</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: paddingBottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sign in to your GlamNet account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputWrap,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius },
              ]}
            >
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.dim}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Password
            </Text>
            <View
              style={[
                styles.inputWrap,
                { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius },
              ]}
            >
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.dim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} activeOpacity={0.7}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
            <Text style={[styles.forgotText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {error ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40", borderRadius: colors.radius },
              ]}
            >
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                {error}
              </Text>
            </View>
          ) : null}
        </View>
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
            styles.signInBtn,
            {
              backgroundColor: loading ? colors.primaryDim : colors.primary,
              borderRadius: colors.radius,
            },
          ]}
          onPress={handleSignIn}
          activeOpacity={0.82}
          disabled={loading}
        >
          <Text style={[styles.signInBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={styles.signUpLink}
          activeOpacity={0.7}
        >
          <Text style={[styles.signUpLinkText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign Up</Text>
          </Text>
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
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: { fontSize: 18 },
  scrollContent: { padding: 24, gap: 28 },
  titleBlock: { gap: 6 },
  title: { fontSize: 28, letterSpacing: -0.8 },
  sub: { fontSize: 14, lineHeight: 20 },
  form: { gap: 16 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 15 },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, flex: 1 },
  bottomBar: { borderTopWidth: 1, gap: 12 },
  signInBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  signInBtnText: { fontSize: 16, letterSpacing: -0.2 },
  signUpLink: { alignItems: "center", paddingVertical: 4 },
  signUpLinkText: { fontSize: 14 },
});

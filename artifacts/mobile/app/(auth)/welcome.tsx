import { router } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop, paddingBottom }]}>
      {/* Hero image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/discover-hero.png")}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.imageOverlay,
            {
              background: undefined,
            },
          ]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: colors.background,
                opacity: 0,
              },
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: fadeAnim,
                justifyContent: "flex-end",
                padding: 0,
              },
            ]}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: height * 0.45,
                backgroundColor: colors.background,
                opacity: 0.92,
              }}
            />
          </Animated.View>
        </View>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logo}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoMarkText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>G</Text>
          </View>
          <View>
            <Text style={[styles.logoText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              GlamNet
            </Text>
            <Text style={[styles.logoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              CREATIVE COLLECTIVE
            </Text>
          </View>
        </View>

        {/* Tagline */}
        <View style={styles.tagline}>
          <Text style={[styles.taglineTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Where South African{"\n"}beauty talent thrives.
          </Text>
          <Text style={[styles.taglineSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Connect models, artists, and clients for extraordinary creative campaigns.
          </Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsBar, { backgroundColor: colors.warm, borderRadius: colors.radius }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>247</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Jobs Created
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>R186K</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Paid Out
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.purple, fontFamily: "Inter_700Bold" }]}>11+</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Talent
            </Text>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.82}
          >
            <Text style={[styles.primaryBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              Get Started
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card },
            ]}
            onPress={() => router.push("/(auth)/signin")}
            activeOpacity={0.82}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
    marginTop: height * 0.3,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    fontSize: 24,
    letterSpacing: -1,
  },
  logoText: {
    fontSize: 24,
    letterSpacing: -0.8,
  },
  logoSub: {
    fontSize: 9,
    letterSpacing: 2,
  },
  tagline: {
    gap: 8,
  },
  taglineTitle: {
    fontSize: 28,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  taglineSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsBar: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    marginVertical: 4,
  },
  ctas: {
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
  },
});

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface Step {
  num: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  body: string;
  color: string;
  tip: string;
}

const CLIENT_STEPS: Step[] = [
  {
    num: "01",
    icon: "search",
    title: "Browse Verified Talent",
    body: "Search models and artists by province, category, and availability. Every profile on GlamNet is verified — so you know exactly who you're hiring.",
    color: "#C4526E",
    tip: "Filter by 'House Calls Only' to find artists who come to you.",
  },
  {
    num: "02",
    icon: "calendar",
    title: "Request a Booking",
    body: "Select your date, service type and location. Add your creative brief or mood board notes. For Instant Book artists, your booking is confirmed immediately.",
    color: "#B8893A",
    tip: "Instant Book artists have a ⚡ badge — no waiting required.",
  },
  {
    num: "03",
    icon: "users",
    title: "Build Your Team",
    body: "Need a full production team? Use the Team Builder to assemble models, hair, makeup, and photographers into one cohesive package with a combined day rate.",
    color: "#7A5AB8",
    tip: "Teams handle scheduling coordination for you.",
  },
  {
    num: "04",
    icon: "dollar-sign",
    title: "Pay Securely",
    body: "Payment is only released once the shoot is complete and both parties confirm. GlamNet holds funds in escrow — protecting both you and the artist.",
    color: "#3A9E6A",
    tip: "100% of your payment goes to the artist — no hidden client fees.",
  },
];

const ARTIST_STEPS: Step[] = [
  {
    num: "01",
    icon: "user-plus",
    title: "Create Your Profile",
    body: "Sign up as a Creative Professional. Add your role, location, rates and whether you offer house calls. The more detail, the more bookings you'll attract.",
    color: "#7A5AB8",
    tip: "Profiles with portfolios get 3× more booking requests.",
  },
  {
    num: "02",
    icon: "shield",
    title: "Get Verified",
    body: "Complete our four-stage verification: Identity, Portfolio, First Appointment, and Skill Assessment. Each badge builds client trust and unlocks new opportunities.",
    color: "#C4526E",
    tip: "Fully verified artists appear first in search results.",
  },
  {
    num: "03",
    icon: "star",
    title: "Build Your Rep Score",
    body: "Every completed booking, great review, and referral adds to your Rep Score. Higher scores unlock Elite tier status, premium placement, and higher rates.",
    color: "#B8893A",
    tip: "Refer friends and earn R500 per successful referral.",
  },
  {
    num: "04",
    icon: "trending-up",
    title: "Grow & Earn",
    body: "Join teams, accept jobs, and collect payments — all in one place. GlamNet handles invoicing and payment processing so you can focus on your craft.",
    color: "#3A9E6A",
    tip: "Artists on GlamNet earn an average of R12,400/month.",
  },
];

const TIERS = [
  { name: "New", color: "#8C7B72", rep: "0–24", perks: "Profile live, job access" },
  { name: "Active", color: "#4A7AB8", rep: "25–49", perks: "Priority search ranking" },
  { name: "Rising", color: "#B8893A", rep: "50–74", perks: "Featured listings, bonus referrals" },
  { name: "Pro", color: "#7A5AB8", rep: "75–89", perks: "Client introductions, premium badge" },
  { name: "Elite", color: "#C4526E", rep: "90–100", perks: "Top placement, editorial access" },
];

const FAQS = [
  {
    q: "Is GlamNet only for South African artists?",
    a: "Yes — GlamNet is built exclusively for the South African beauty and creative industry, with province-level search and ZAR pricing throughout.",
  },
  {
    q: "How does the call-out fee work?",
    a: "Artists who offer house calls set a base fee plus a per-km rate. This is calculated transparently and shown before you confirm your booking.",
  },
  {
    q: "What is Instant Book?",
    a: "Artists with Instant Book enabled skip the request-approval step. Your booking is confirmed the moment you submit, with no waiting.",
  },
  {
    q: "When does the artist get paid?",
    a: "Payment is held in escrow until both parties confirm the job is complete. Artists typically receive funds within 1–2 business days.",
  },
  {
    q: "How do I raise my Rep Score?",
    a: "Complete bookings, receive reviews, respond promptly to clients, and refer other artists. Consistent professionalism is the fastest path to Elite tier.",
  },
];

export default function HowItWorksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeRole, setActiveRole] = useState<"client" | "artist">("client");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const steps = activeRole === "client" ? CLIENT_STEPS : ARTIST_STEPS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: paddingTop + 10,
            paddingHorizontal: 16,
            paddingBottom: 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          How It Works
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius + 8,
            },
          ]}
        >
          <View style={[styles.heroOrb, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
          <Text style={[styles.heroTag, { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" }]}>
            THE GLAMNET PROCESS
          </Text>
          <Text style={[styles.heroTitle, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            South Africa's beauty talent platform
          </Text>
          <Text style={[styles.heroSub, { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" }]}>
            Every artist is verified. Every booking is protected. Every payment is fair.
          </Text>
          {/* Stats */}
          <View style={styles.heroStats}>
            {[["247", "Jobs"], ["R186K", "Paid Out"], ["11+", "Artists"], ["9", "Provinces"]].map(([n, l]) => (
              <View key={l} style={styles.heroStat}>
                <Text style={[styles.heroStatNum, { color: "#fff", fontFamily: "Inter_700Bold" }]}>{n}</Text>
                <Text style={[styles.heroStatLabel, { color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" }]}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Role toggle */}
        <View style={[styles.roleToggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {(["client", "artist"] as const).map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => setActiveRole(role)}
              style={[
                styles.roleToggleBtn,
                {
                  backgroundColor: activeRole === role ? colors.card : "transparent",
                  borderRadius: colors.radius - 2,
                  shadowColor: activeRole === role ? "#000" : "transparent",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: activeRole === role ? 0.08 : 0,
                  shadowRadius: 4,
                  elevation: activeRole === role ? 2 : 0,
                },
              ]}
              activeOpacity={0.85}
            >
              <Feather
                name={role === "client" ? "briefcase" : "scissors"}
                size={14}
                color={activeRole === role ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.roleToggleBtnText,
                  {
                    color: activeRole === role ? colors.foreground : colors.mutedForeground,
                    fontFamily: activeRole === role ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
              >
                {role === "client" ? "I'm a Client" : "I'm a Creative"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Steps */}
        <View style={styles.stepsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {activeRole === "client" ? "How to hire talent" : "How to get booked"}
          </Text>
          {steps.map((step, i) => (
            <View key={step.num} style={styles.stepRow}>
              {/* Connector line */}
              <View style={styles.stepLeft}>
                <View style={[styles.stepNumCircle, { backgroundColor: step.color, borderRadius: 18 }]}>
                  <Feather name={step.icon} size={18} color="#fff" />
                </View>
                {i < steps.length - 1 && (
                  <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={[styles.stepBody, { paddingBottom: i < steps.length - 1 ? 28 : 0 }]}>
                <Text style={[styles.stepNumLabel, { color: step.color, fontFamily: "Inter_600SemiBold" }]}>
                  {step.num}
                </Text>
                <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepBody2, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {step.body}
                </Text>
                <View style={[styles.tipCard, { backgroundColor: step.color + "10", borderColor: step.color + "30", borderRadius: 8 }]}>
                  <Feather name="info" size={12} color={step.color} />
                  <Text style={[styles.tipText, { color: step.color, fontFamily: "Inter_500Medium" }]}>
                    {step.tip}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Verification system */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Verification System
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Every artist completes up to four verification stages. Look for these badges on profiles.
          </Text>
          <View style={styles.verifyGrid}>
            {[
              { icon: "shield" as const, label: "Identity", color: colors.primary, desc: "ID verified by GlamNet" },
              { icon: "image" as const, label: "Portfolio", color: colors.purple, desc: "Work assessed by team" },
              { icon: "check-square" as const, label: "First Appt", color: colors.accent, desc: "Completed a booking" },
              { icon: "award" as const, label: "Skill Assessed", color: colors.green, desc: "Expert review passed" },
            ].map((v) => (
              <View
                key={v.label}
                style={[
                  styles.verifyCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.verifyIcon, { backgroundColor: v.color + "15", borderRadius: 10 }]}>
                  <Feather name={v.icon} size={18} color={v.color} />
                </View>
                <Text style={[styles.verifyLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {v.label}
                </Text>
                <Text style={[styles.verifyDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {v.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rep / Tiers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Rep Score & Tiers
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your Rep Score grows with every booking, review, and referral. Higher tiers unlock premium features.
          </Text>
          {TIERS.map((tier, i) => (
            <View
              key={tier.name}
              style={[
                styles.tierRow,
                {
                  backgroundColor: colors.card,
                  borderColor: tier.color + "30",
                  borderRadius: colors.radius,
                  borderLeftColor: tier.color,
                },
              ]}
            >
              <View style={[styles.tierBadge, { backgroundColor: tier.color }]}>
                <Text style={[styles.tierBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  {tier.name}
                </Text>
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierRep, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Rep {tier.rep}
                </Text>
                <Text style={[styles.tierPerks, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {tier.perks}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Frequently Asked
          </Text>
          {FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.8}
              style={[
                styles.faqItem,
                {
                  backgroundColor: colors.card,
                  borderColor: expandedFaq === i ? colors.primary + "40" : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.faqHeader}>
                <Text
                  style={[
                    styles.faqQ,
                    {
                      color: colors.foreground,
                      fontFamily: expandedFaq === i ? "Inter_600SemiBold" : "Inter_500Medium",
                      flex: 1,
                    },
                  ]}
                >
                  {faq.q}
                </Text>
                <Feather
                  name={expandedFaq === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>
              {expandedFaq === i && (
                <Text style={[styles.faqA, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {faq.a}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View
          style={[
            styles.ctaCard,
            {
              backgroundColor: colors.warm,
              borderRadius: colors.radius + 4,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.ctaTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Ready to get started?
          </Text>
          <Text style={[styles.ctaSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Join South Africa's fastest-growing creative talent network.
          </Text>
          <View style={styles.ctaBtns}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={() => router.push("/(tabs)")}
              activeOpacity={0.82}
            >
              <Text style={[styles.ctaBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                Browse Talent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ctaBtn,
                { backgroundColor: "transparent", borderColor: colors.border, borderRadius: colors.radius, borderWidth: 1 },
              ]}
              onPress={() => router.push("/(tabs)/earn")}
              activeOpacity={0.82}
            >
              <Text style={[styles.ctaBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Find Jobs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 24 },
  heroCard: { padding: 24, overflow: "hidden", position: "relative" },
  heroOrb: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  heroTag: { fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  heroTitle: { fontSize: 22, letterSpacing: -0.6, lineHeight: 28, marginBottom: 8 },
  heroSub: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  heroStats: { flexDirection: "row", gap: 0 },
  heroStat: { flex: 1, alignItems: "center", gap: 2 },
  heroStatNum: { fontSize: 16, letterSpacing: -0.4 },
  heroStatLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  roleToggle: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  roleToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  roleToggleBtnText: { fontSize: 13 },
  stepsSection: { gap: 0 },
  sectionTitle: { fontSize: 18, letterSpacing: -0.4, marginBottom: 6 },
  sectionSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  stepRow: { flexDirection: "row", gap: 16 },
  stepLeft: { alignItems: "center" },
  stepNumCircle: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  stepConnector: { width: 2, flex: 1, marginTop: 4 },
  stepBody: { flex: 1, gap: 6, paddingBottom: 28 },
  stepNumLabel: { fontSize: 10, letterSpacing: 1 },
  stepTitle: { fontSize: 16, letterSpacing: -0.3 },
  stepBody2: { fontSize: 13, lineHeight: 19 },
  tipCard: { flexDirection: "row", gap: 6, padding: 10, borderWidth: 1, alignItems: "flex-start" },
  tipText: { fontSize: 11, flex: 1, lineHeight: 16 },
  section: { gap: 12 },
  verifyGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  verifyCard: { width: "47.5%", padding: 14, borderWidth: 1, gap: 8 },
  verifyIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  verifyLabel: { fontSize: 13 },
  verifyDesc: { fontSize: 11, lineHeight: 15 },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  tierBadgeText: { fontSize: 11, letterSpacing: 0.3 },
  tierInfo: { flex: 1, gap: 2 },
  tierRep: { fontSize: 11 },
  tierPerks: { fontSize: 12 },
  faqItem: { borderWidth: 1, overflow: "hidden" },
  faqHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  faqQ: { fontSize: 13, lineHeight: 18 },
  faqA: { fontSize: 13, lineHeight: 18, padding: 14, paddingTop: 0 },
  ctaCard: { padding: 20, gap: 10 },
  ctaTitle: { fontSize: 18, letterSpacing: -0.4 },
  ctaSub: { fontSize: 13 },
  ctaBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  ctaBtn: { flex: 1, height: 46, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { fontSize: 14 },
});

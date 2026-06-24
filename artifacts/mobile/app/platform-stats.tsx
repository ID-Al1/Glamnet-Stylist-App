/**
 * Platform Stats screen — public-facing network effects dashboard.
 * Shows GlamNet's social proof numbers + user's personal impact.
 *
 * Route: /platform-stats
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

interface PlatformPulse {
  totalCreators: number;
  totalBookings: number;
  openCastingCalls: number;
}

interface PersonalImpact {
  totalBookings: number;
  referralCode?: { code: string; usesCount: number };
}

function BigStat({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <View style={styles.bigStatCard}>
      <Text style={styles.bigStatIcon}>{icon}</Text>
      <Text style={styles.bigStatValue}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

export default function PlatformStatsScreen() {
  const { token } = useAuth();
  const [pulse, setPulse] = useState<PlatformPulse | null>(null);
  const [personal, setPersonal] = useState<PersonalImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [pulseRes, insightsRes, referralRes] = await Promise.allSettled([
          fetch(`${API_BASE}/analytics/pulse`),
          fetch(`${API_BASE}/insights/mine`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/flywheel/referral/mine`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (pulseRes.status === "fulfilled" && pulseRes.value.ok) {
          setPulse(await pulseRes.value.json());
        }

        const impact: PersonalImpact = { totalBookings: 0 };
        if (insightsRes.status === "fulfilled" && insightsRes.value.ok) {
          const d = await insightsRes.value.json();
          impact.totalBookings = d.totalBookings ?? 0;
        }
        if (referralRes.status === "fulfilled" && referralRes.value.ok) {
          const d = await referralRes.value.json();
          impact.referralCode = d.referralCode;
        }
        setPersonal(impact);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>GlamNet Network</Text>
      <Text style={styles.subtitle}>The South African beauty & fashion talent platform</Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} size="large" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Platform pulse */}
          {pulse && (
            <View style={styles.statsGrid}>
              <BigStat
                icon="🎨"
                value={pulse.totalCreators.toLocaleString()}
                label="Creators"
              />
              <BigStat
                icon="📅"
                value={pulse.totalBookings.toLocaleString()}
                label="Bookings"
              />
              <BigStat
                icon="📸"
                value={pulse.openCastingCalls.toLocaleString()}
                label="Open Castings"
              />
            </View>
          )}

          {/* Personal impact */}
          {personal && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your impact</Text>
              <View style={styles.impactCard}>
                <View style={styles.impactRow}>
                  <Text style={styles.impactIcon}>📅</Text>
                  <Text style={styles.impactLabel}>Bookings you've been part of</Text>
                  <Text style={styles.impactValue}>{personal.totalBookings}</Text>
                </View>
                {personal.referralCode && (
                  <View style={styles.impactRow}>
                    <Text style={styles.impactIcon}>🔗</Text>
                    <Text style={styles.impactLabel}>People you've referred</Text>
                    <Text style={styles.impactValue}>{personal.referralCode.usesCount}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Referral code share */}
          {personal?.referralCode && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your referral code</Text>
              <View style={styles.referralCard}>
                <Text style={styles.referralCode}>{personal.referralCode.code}</Text>
                <Text style={styles.referralSub}>
                  Share this code with stylists, models, and photographers. Every person who joins with your code
                  strengthens the GlamNet network.
                </Text>
                <TouchableOpacity
                  style={styles.castingsLink}
                  onPress={() => router.push("/castings")}
                >
                  <Text style={styles.castingsLinkText}>Browse casting calls →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>The more you contribute, the stronger the network</Text>
            <Text style={styles.ctaBody}>
              Every portfolio you build, every casting you post, every booking you complete — it all makes GlamNet
              more valuable for every SA creative.
            </Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/castings")}>
              <Text style={styles.ctaBtnText}>Explore Casting Calls</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  backBtn: { marginBottom: 8 },
  backText: { color: Colors.accent, fontSize: 15, fontFamily: "Inter_500Medium" },
  title: { fontSize: 26, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 24 },

  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 28, flexWrap: "wrap" },
  bigStatCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  bigStatIcon: { fontSize: 24 },
  bigStatValue: { fontSize: 22, fontFamily: "Fraunces_700Bold", color: Colors.accent },
  bigStatLabel: { fontSize: 11, color: Colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "center" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 12 },

  impactCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  impactIcon: { fontSize: 20 },
  impactLabel: { flex: 1, fontSize: 14, color: Colors.foreground, fontFamily: "Inter_400Regular" },
  impactValue: { fontSize: 18, fontFamily: "Fraunces_700Bold", color: Colors.accent },

  referralCard: {
    backgroundColor: Colors.accentDim,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 18,
  },
  referralCode: { fontSize: 28, fontFamily: "Fraunces_700Bold", color: Colors.accent, marginBottom: 8, letterSpacing: 2 },
  referralSub: { fontSize: 13, color: Colors.foreground, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 14 },
  castingsLink: {},
  castingsLinkText: { fontSize: 14, color: Colors.accent, fontFamily: "Inter_600SemiBold" },

  ctaSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaTitle: { fontSize: 17, fontFamily: "Fraunces_700Bold", color: Colors.foreground, textAlign: "center", marginBottom: 10 },
  ctaBody: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18, marginBottom: 16 },
  ctaBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
  ctaBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

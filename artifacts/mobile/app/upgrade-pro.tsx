/**
 * Pro upgrade screen — shows features, price, and starts Paystack checkout.
 *
 * Route: /upgrade-pro
 * Open as modal from profile or any Pro-gated feature.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

const PRO_FEATURES = [
  { icon: "🖼", label: "Unlimited portfolio items", sub: "Free tier: 5 max" },
  { icon: "🔝", label: "Priority in search results", sub: "More eyes on your profile" },
  { icon: "🪪", label: "Verification access", sub: "Apply for all 4 badge types" },
  { icon: "📊", label: "Career analytics", sub: "Rate benchmarking + trends" },
  { icon: "💸", label: "5% platform fee", sub: "vs. 10% on free tier" },
];

type Status = "idle" | "loading" | "checking" | "already-pro" | "error";

export default function UpgradeProScreen() {
  const { token } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPro, setIsPro] = useState(false);

  // Check current tier
  useEffect(() => {
    (async () => {
      setStatus("checking");
      try {
        const res = await fetch(`${API_BASE}/subscriptions/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.isPro) { setIsPro(true); setStatus("already-pro"); }
        else setStatus("idle");
      } catch { setStatus("idle"); }
    })();
  }, [token]);

  const startUpgrade = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/subscriptions/upgrade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Could not start upgrade");
        setStatus("error");
        return;
      }
      // Open Paystack checkout in browser
      if (data.checkoutUrl) {
        await Linking.openURL(data.checkoutUrl);
        // After returning, verify
        Alert.alert(
          "Payment complete?",
          "If you completed payment, tap Activate Pro to unlock your benefits.",
          [
            { text: "Not yet", style: "cancel", onPress: () => setStatus("idle") },
            {
              text: "Activate Pro",
              onPress: async () => {
                const r = await fetch(`${API_BASE}/subscriptions/activate`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (r.ok) {
                  setStatus("already-pro");
                  setIsPro(true);
                } else {
                  Alert.alert("Could not activate", "If payment went through, it will auto-activate within minutes.");
                  setStatus("idle");
                }
              },
            },
          ]
        );
      }
    } catch (e: any) {
      setErrorMsg(e.message ?? "Error");
      setStatus("error");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>✕ Close</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>⭐</Text>
        <Text style={styles.heroTitle}>GlamNet Pro</Text>
        <Text style={styles.heroPrice}>
          <Text style={styles.heroPriceAmount}>R 149</Text>
          <Text style={styles.heroPricePer}> / month</Text>
        </Text>
        <Text style={styles.heroSub}>For serious South African creatives</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        {PRO_FEATURES.map(({ icon, label, sub }) => (
          <View key={label} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{label}</Text>
              <Text style={styles.featureSub}>{sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      {status === "already-pro" ? (
        <View style={styles.alreadyProBox}>
          <Text style={styles.alreadyProText}>✅ You're already on Pro</Text>
        </View>
      ) : status === "error" ? (
        <>
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => setStatus("idle")}>
            <Text style={styles.ctaBtnText}>Try Again</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.ctaBtn, (status === "loading" || status === "checking") && styles.ctaBtnDisabled]}
          onPress={startUpgrade}
          disabled={status === "loading" || status === "checking"}
        >
          {status === "loading" || status === "checking"
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.ctaBtnText}>Upgrade to Pro — R 149/mo</Text>
          }
        </TouchableOpacity>
      )}

      <Text style={styles.legalNote}>
        Cancel anytime from your profile. Benefits continue until end of current billing period.
        Payment processed securely via Paystack.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  backBtn: { alignSelf: "flex-end", marginBottom: 8 },
  backText: { color: Colors.mutedForeground, fontSize: 15, fontFamily: "Inter_500Medium" },

  hero: { alignItems: "center", paddingVertical: 24, marginBottom: 24 },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontFamily: "Fraunces_700Bold", color: Colors.foreground, marginBottom: 8 },
  heroPrice: { marginBottom: 4 },
  heroPriceAmount: { fontSize: 32, fontFamily: "Fraunces_700Bold", color: Colors.accent },
  heroPricePer: { fontSize: 16, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },
  heroSub: { fontSize: 14, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  featuresCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  featureIcon: { fontSize: 24, lineHeight: 30 },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 2 },
  featureSub: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  alreadyProBox: {
    backgroundColor: Colors.greenDim ?? Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  alreadyProText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.green },

  errorBox: { backgroundColor: "#450a0a33", borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { color: "#f87171", fontSize: 14, fontFamily: "Inter_400Regular" },

  legalNote: {
    fontSize: 11,
    color: Colors.mutedForeground,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
});

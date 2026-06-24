/**
 * Learning Center — curated resource cards for SA fashion/beauty creatives.
 *
 * Content is static in v1 (no CMS needed). Each card links out via
 * Linking.openURL. Pro users see advanced content.
 *
 * Route: /learn
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import Colors from "@/constants/colors";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

// ─── Content ──────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  category: string;
  title: string;
  description: string;
  url: string;
  isPro?: boolean;
  readTime?: string;
}

const RESOURCES: Resource[] = [
  // Getting started
  {
    id: "gs1",
    category: "Getting Started",
    title: "How to write a GlamNet bio that books jobs",
    description: "Your bio is your 30-second pitch. Learn what SA clients actually read and what makes them click 'Book Now'.",
    url: "https://docs.glamnet.co.za/guides/bio",
    readTime: "4 min",
  },
  {
    id: "gs2",
    category: "Getting Started",
    title: "Setting your rate as a new talent",
    description: "Undercharging kills your brand. Use our rate calculator and understand industry-standard day rates in SA.",
    url: "https://docs.glamnet.co.za/guides/rates",
    readTime: "6 min",
  },
  {
    id: "gs3",
    category: "Getting Started",
    title: "Building a portfolio from scratch with no budget",
    description: "TFP shoots, student collaborations, and personal projects — how to build portfolio equity before you have paid work.",
    url: "https://docs.glamnet.co.za/guides/portfolio-zero",
    readTime: "8 min",
  },
  // Bookings
  {
    id: "bk1",
    category: "Bookings",
    title: "Understanding a call sheet",
    description: "Your first big job and the call sheet looks like a foreign language. We break down every line.",
    url: "https://docs.glamnet.co.za/guides/call-sheet",
    readTime: "5 min",
  },
  {
    id: "bk2",
    category: "Bookings",
    title: "How escrow protects you on GlamNet",
    description: "No more chasing invoices. Learn how our escrow system locks in your payment before the shoot.",
    url: "https://docs.glamnet.co.za/guides/escrow",
    readTime: "3 min",
  },
  // Legal & Finance
  {
    id: "lf1",
    category: "Legal & Finance",
    title: "Freelance contracts 101 in South Africa",
    description: "What to include, what to refuse, and which clauses protect your image rights under SA law.",
    url: "https://docs.glamnet.co.za/guides/contracts-sa",
    readTime: "10 min",
  },
  {
    id: "lf2",
    category: "Legal & Finance",
    title: "Tax as a freelance creative in SA",
    description: "SARS provisional tax, VAT thresholds, and what expenses you can claim. Practical, not scary.",
    url: "https://docs.glamnet.co.za/guides/tax-sa",
    readTime: "12 min",
  },
  // Pro only
  {
    id: "pr1",
    category: "Pro Growth",
    title: "How to pitch agencies as a GlamNet creator",
    description: "A step-by-step template to cold-pitch Cape Town and Joburg agencies using your verified GlamNet profile.",
    url: "https://docs.glamnet.co.za/guides/agency-pitch",
    readTime: "7 min",
    isPro: true,
  },
  {
    id: "pr2",
    category: "Pro Growth",
    title: "Building a repeat client base on GlamNet",
    description: "How top earners on the platform turn one booking into a 12-month relationship.",
    url: "https://docs.glamnet.co.za/guides/repeat-clients",
    readTime: "8 min",
    isPro: true,
  },
];

const CATEGORIES = Array.from(new Set(RESOURCES.map((r) => r.category)));

// ─── Card ─────────────────────────────────────────────────────────────────────

function ResourceCard({ resource, isPro }: { resource: Resource; isPro: boolean }) {
  const locked = resource.isPro && !isPro;

  const handlePress = () => {
    if (locked) {
      router.push("/upgrade-pro");
      return;
    }
    Linking.openURL(resource.url).catch(() => {});
  };

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.cardLocked]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{resource.title}</Text>
        {resource.isPro && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>Pro</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardDesc}>{resource.description}</Text>
      <View style={styles.cardMeta}>
        {resource.readTime && <Text style={styles.cardReadTime}>⏱ {resource.readTime} read</Text>}
        {locked
          ? <Text style={styles.lockedLink}>🔒 Upgrade to unlock →</Text>
          : <Text style={styles.readLink}>Read →</Text>
        }
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { token } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/subscriptions/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsPro(!!data.isPro);
        }
      } catch { /* default to false */ }
    })();
  }, [token]);

  const filtered = activeCategory === "All"
    ? RESOURCES
    : RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Center</Text>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {["All", ...CATEGORIES].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resource list */}
      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((r) => (
          <ResourceCard key={r.id} resource={r} isPro={isPro} />
        ))}

        {!isPro && (
          <TouchableOpacity style={styles.proCtaBanner} onPress={() => router.push("/upgrade-pro")}>
            <Text style={styles.proCtaTitle}>⭐ Upgrade to Pro</Text>
            <Text style={styles.proCtaSub}>Unlock advanced guides on agency pitching, client retention & more</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: { flex: 1, fontSize: 20, fontFamily: "Fraunces_700Bold", color: Colors.foreground },
  backText: { color: Colors.accent, fontSize: 15, fontFamily: "Inter_500Medium" },

  filterScroll: { maxHeight: 52, backgroundColor: Colors.background },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterChipText: { fontSize: 13, color: Colors.foreground, fontFamily: "Inter_500Medium" },
  filterChipTextActive: { color: "#fff" },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  cardLocked: { opacity: 0.75 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.foreground, flex: 1 },
  cardDesc: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 10 },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardReadTime: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },
  readLink: { fontSize: 13, color: Colors.accent, fontFamily: "Inter_600SemiBold" },
  lockedLink: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  proBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },

  proCtaBanner: {
    backgroundColor: Colors.accentDim,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: 18,
    marginTop: 8,
    alignItems: "center",
    gap: 6,
  },
  proCtaTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.accent },
  proCtaSub: { fontSize: 13, color: Colors.accent, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
});

/**
 * Career Insights screen — personalised rate benchmarking and booking analytics.
 *
 * Route: /career-insights
 * Link from profile tab or settings.
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

interface InsightsData {
  totalBookings: number;
  avgRateZar: number | null;
  platformAvgRateZar: number | null;
  rateVsPlatformPercent: number | null;
  role: string | null;
  recentBookings: Array<{
    id: string;
    status: string;
    agreedRate?: number;
    createdAt: string;
  }>;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
      {sub ? <Text style={[styles.statSub, accent && styles.statSubAccent]}>{sub}</Text> : null}
    </View>
  );
}

function RateBar({ myRate, platformRate }: { myRate: number; platformRate: number }) {
  const max = Math.max(myRate, platformRate) * 1.2;
  const myPct = (myRate / max) * 100;
  const platPct = (platformRate / max) * 100;

  return (
    <View style={styles.rateBarContainer}>
      <Text style={styles.rateBarTitle}>Your rate vs. platform average</Text>
      <View style={styles.rateBarRow}>
        <Text style={styles.rateBarLabel}>You</Text>
        <View style={styles.rateBarTrack}>
          <View style={[styles.rateBarFill, { width: `${myPct}%`, backgroundColor: Colors.accent }]} />
        </View>
        <Text style={styles.rateBarAmount}>R {myRate}</Text>
      </View>
      <View style={styles.rateBarRow}>
        <Text style={styles.rateBarLabel}>Avg</Text>
        <View style={styles.rateBarTrack}>
          <View style={[styles.rateBarFill, { width: `${platPct}%`, backgroundColor: Colors.blue ?? Colors.muted }]} />
        </View>
        <Text style={styles.rateBarAmount}>R {platformRate}</Text>
      </View>
    </View>
  );
}

export default function CareerInsightsScreen() {
  const { token } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/insights/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Could not load insights");
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message ?? "Error");
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
      <Text style={styles.title}>Career Insights</Text>
      <Text style={styles.subtitle}>Powered by real GlamNet booking data</Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} size="large" />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : data ? (
        <>
          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard
              label="Bookings"
              value={String(data.totalBookings)}
              sub="confirmed + completed"
            />
            <StatCard
              label="Avg rate"
              value={data.avgRateZar ? `R ${data.avgRateZar}` : "—"}
              sub="per booking"
              accent
            />
            {data.rateVsPlatformPercent !== null && (
              <StatCard
                label="vs. peers"
                value={`${data.rateVsPlatformPercent > 0 ? "+" : ""}${data.rateVsPlatformPercent}%`}
                sub={data.rateVsPlatformPercent >= 0 ? "above average" : "below average"}
                accent={data.rateVsPlatformPercent >= 0}
              />
            )}
          </View>

          {/* Rate comparison bar */}
          {data.avgRateZar && data.platformAvgRateZar ? (
            <RateBar myRate={data.avgRateZar} platformRate={data.platformAvgRateZar} />
          ) : (
            <View style={styles.noDataBox}>
              <Text style={styles.noDataText}>
                Complete your first booking to unlock rate comparison data.
              </Text>
            </View>
          )}

          {/* Role insight */}
          {data.role && (
            <View style={styles.roleBox}>
              <Text style={styles.roleBoxTitle}>Your role</Text>
              <Text style={styles.roleBoxValue}>{data.role.replace(/_/g, " ")}</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/castings" })}
                style={styles.roleBoxLink}
              >
                <Text style={styles.roleBoxLinkText}>Browse casting calls for {data.role.replace(/_/g, " ")}s →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recent bookings */}
          {data.recentBookings.length > 0 && (
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>Recent bookings</Text>
              {data.recentBookings.map((b) => (
                <View key={b.id} style={styles.bookingRow}>
                  <View style={[styles.bookingStatusDot, { backgroundColor: b.status === "completed" ? Colors.green : Colors.accentDim }]} />
                  <Text style={styles.bookingStatus}>{b.status}</Text>
                  {b.agreedRate ? <Text style={styles.bookingRate}>R {b.agreedRate}</Text> : null}
                  <Text style={styles.bookingDate}>{new Date(b.createdAt).toLocaleDateString("en-ZA")}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}

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

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  statCardAccent: { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  statValue: { fontSize: 22, fontFamily: "Fraunces_700Bold", color: Colors.foreground },
  statValueAccent: { color: Colors.accent },
  statLabel: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_500Medium", marginTop: 2 },
  statLabelAccent: { color: Colors.accent },
  statSub: { fontSize: 11, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
  statSubAccent: { color: Colors.accent },

  rateBarContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  rateBarTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 14 },
  rateBarRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rateBarLabel: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_500Medium", width: 30 },
  rateBarTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: "hidden" },
  rateBarFill: { height: "100%", borderRadius: 4 },
  rateBarAmount: { fontSize: 12, color: Colors.foreground, fontFamily: "Inter_600SemiBold", width: 48, textAlign: "right" },

  noDataBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  noDataText: { fontSize: 13, color: Colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  roleBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  roleBoxTitle: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_500Medium", marginBottom: 2 },
  roleBoxValue: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.foreground, textTransform: "capitalize", marginBottom: 10 },
  roleBoxLink: {},
  roleBoxLinkText: { fontSize: 13, color: Colors.accent, fontFamily: "Inter_500Medium" },

  recentSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.foreground, marginBottom: 12 },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bookingStatusDot: { width: 8, height: 8, borderRadius: 4 },
  bookingStatus: { fontSize: 13, color: Colors.foreground, fontFamily: "Inter_500Medium", textTransform: "capitalize", flex: 1 },
  bookingRate: { fontSize: 13, color: Colors.accent, fontFamily: "Inter_600SemiBold" },
  bookingDate: { fontSize: 12, color: Colors.mutedForeground, fontFamily: "Inter_400Regular" },

  errorBox: { padding: 16, backgroundColor: "#450a0a33", borderRadius: 12, marginTop: 20 },
  errorText: { color: "#f87171", fontSize: 14, fontFamily: "Inter_400Regular" },
});

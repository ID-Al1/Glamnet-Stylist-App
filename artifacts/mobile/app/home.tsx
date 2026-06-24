import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useBookings } from "@/context/BookingContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useColors } from "@/hooks/useColors";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { bookings } = useBookings();
  const { unreadCount } = useNotifications();

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  if (!user) return null;

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "accepted").length;

  const quickActions = user.role === "stylist"
    ? [
        { icon: "dollar-sign" as const, label: "Appointments", sub: "Manage bookings", route: "/(tabs)/earn" as const, color: colors.green },
        { icon: "compass" as const, label: "Browse Jobs", sub: "Find castings", route: "/(tabs)" as const, color: colors.primary },
        { icon: "users" as const, label: "My Teams", sub: "View your teams", route: "/(tabs)/teams" as const, color: colors.sage },
        { icon: "user" as const, label: "My Profile", sub: "Update portfolio", route: "/profile" as const, color: colors.accent },
      ]
    : user.role === "brand"
    ? [
        { icon: "briefcase" as const, label: "Castings", sub: "Manage castings", route: "/(tabs)/castings" as const, color: colors.primary },
        { icon: "compass" as const, label: "Find Talent", sub: "Browse artists", route: "/(tabs)" as const, color: colors.accent },
        { icon: "users" as const, label: "Hire a Team", sub: "Browse teams", route: "/(tabs)/teams" as const, color: colors.sage },
        { icon: "bar-chart-2" as const, label: "Dashboard", sub: "Your activity", route: "/(tabs)/dashboard" as const, color: colors.purple },
      ]
    : [
        { icon: "compass" as const, label: "Find Talent", sub: "Browse artists", route: "/(tabs)" as const, color: colors.primary },
        { icon: "users" as const, label: "Browse Teams", sub: "Hire a full team", route: "/(tabs)/teams" as const, color: colors.sage },
        { icon: "calendar" as const, label: "My Bookings", sub: "Track appointments", route: "/(tabs)/dashboard" as const, color: colors.accent },
        { icon: "message-circle" as const, label: "Messages", sub: "Your conversations", route: "/(tabs)/messages" as const, color: colors.purple },
      ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: paddingTop + 10,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={[styles.notifBtn, { backgroundColor: colors.primaryDim, borderRadius: 20 }]}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={16} color={colors.primary} />
              <Text style={[styles.notifCount, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {unreadCount}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetSection}>
          <Text style={[styles.greetLine, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {greeting()},
          </Text>
          <Text style={[styles.greetName, { color: colors.foreground, fontFamily: "Fraunces_700Bold" }]}>
            {user.name.split(" ")[0]}
          </Text>
          <Text style={[styles.greetSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user.role === "stylist"
              ? "Your creative studio awaits"
              : user.role === "brand"
              ? "Ready to cast your next campaign"
              : "Discover South Africa's best talent"}
          </Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius + 4 }]}>
          {[
            { label: "Rep Score", value: String(user.repScore), color: colors.foreground },
            { label: "Jobs", value: String(user.jobsCount), color: colors.foreground },
            { label: "Earned", value: `R${user.earnings.toLocaleString()}`, color: colors.accent },
            { label: "Referrals", value: String(user.referrals), color: colors.sage },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.stat}>
                <Text style={[styles.statVal, { color: stat.color, fontFamily: "Inter_700Bold" }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {stat.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Booking status strip (if any) */}
        {(pendingBookings > 0 || confirmedBookings > 0) && (
          <TouchableOpacity
            style={[styles.bookingStrip, { backgroundColor: colors.primaryDim, borderRadius: colors.radius, borderColor: colors.primary + "30", borderWidth: 1 }]}
            onPress={() => { Haptics.selectionAsync(); router.push("/(tabs)/dashboard"); }}
            activeOpacity={0.82}
          >
            <View style={[styles.bookingStripIcon, { backgroundColor: colors.primary, borderRadius: 10 }]}>
              <Feather name="calendar" size={16} color="#fff" />
            </View>
            <View style={styles.bookingStripText}>
              <Text style={[styles.bookingStripTitle, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {pendingBookings > 0
                  ? `${pendingBookings} pending booking${pendingBookings !== 1 ? "s" : ""}`
                  : `${confirmedBookings} confirmed booking${confirmedBookings !== 1 ? "s" : ""}`}
              </Text>
              <Text style={[styles.bookingStripSub, { color: colors.primaryDeep, fontFamily: "Inter_400Regular" }]}>
                Tap to view your bookings
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                onPress={() => { Haptics.selectionAsync(); router.push(action.route as any); }}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + "18", borderRadius: 12 }]}>
                  <Feather name={action.icon} size={20} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {action.label}
                </Text>
                <Text style={[styles.actionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {action.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tier & rep info */}
        <View style={[styles.tierCard, { backgroundColor: colors.warm, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.tierLeft}>
            <Text style={[styles.tierTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {user.tier} Tier
            </Text>
            <Text style={[styles.tierSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Complete more bookings to level up your status
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.tierBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 2 }]}
            onPress={() => router.push("/how-it-works")}
            activeOpacity={0.82}
          >
            <Text style={[styles.tierBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
              Learn More
            </Text>
          </TouchableOpacity>
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
  headerRight: { flexDirection: "row", alignItems: "center" },
  notifBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  notifCount: { fontSize: 12 },
  scroll: { padding: 20, gap: 20 },
  greetSection: { gap: 4, paddingTop: 4 },
  greetLine: { fontSize: 13 },
  greetName: { fontSize: 32, letterSpacing: -0.8, lineHeight: 36 },
  greetSub: { fontSize: 13, marginTop: 4 },
  statsCard: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 17, letterSpacing: -0.4 },
  statLabel: { fontSize: 9, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28 },
  bookingStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  bookingStripIcon: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  bookingStripText: { flex: 1, gap: 2 },
  bookingStripTitle: { fontSize: 13 },
  bookingStripSub: { fontSize: 11 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, letterSpacing: 0.4, textTransform: "uppercase" as const },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap" as const, gap: 10 },
  actionCard: {
    width: "47.5%",
    padding: 14,
    gap: 8,
    borderWidth: 1,
  },
  actionIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 13 },
  actionSub: { fontSize: 11 },
  tierCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: 1,
  },
  tierLeft: { flex: 1, gap: 3 },
  tierTitle: { fontSize: 14 },
  tierSub: { fontSize: 11, lineHeight: 15 },
  tierBtn: { paddingHorizontal: 14, paddingVertical: 9 },
  tierBtnText: { fontSize: 12 },
});

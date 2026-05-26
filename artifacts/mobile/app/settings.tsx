import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SA_PROVINCES } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  iconColor,
  right,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  sublabel?: string;
  iconColor?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  const color = destructive ? colors.destructive : iconColor ?? colors.mutedForeground;

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.72 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: color + "16", borderRadius: 9 }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <View style={styles.rowText}>
        <Text
          style={[
            styles.rowLabel,
            {
              color: destructive ? colors.destructive : colors.foreground,
              fontFamily: "Inter_500Medium",
            },
          ]}
        >
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {sublabel}
          </Text>
        )}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={16} color={colors.dim} /> : null)}
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon,
  label,
  sublabel,
  iconColor,
  value,
  onChange,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  sublabel?: string;
  iconColor?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const colors = useColors();
  const color = iconColor ?? colors.mutedForeground;
  return (
    <SettingsRow
      icon={icon}
      label={label}
      sublabel={sublabel}
      iconColor={color}
      right={
        <Switch
          value={value}
          onValueChange={(v) => { Haptics.selectionAsync(); onChange(v); }}
          trackColor={{ false: colors.muted, true: colors.primary + "80" }}
          thumbColor={value ? colors.primary : colors.dim}
          ios_backgroundColor={colors.muted}
        />
      }
    />
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.numberInputRow, { borderBottomColor: colors.borderLight }]}>
      <Text style={[styles.numberLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      <View
        style={[
          styles.numberInputWrap,
          { backgroundColor: colors.muted, borderRadius: 9, borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        {prefix && (
          <Text style={[styles.numberAffix, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {prefix}
          </Text>
        )}
        <TextInput
          value={String(value)}
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(n)) onChange(n);
          }}
          keyboardType="numeric"
          style={[styles.numberInput, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          selectTextOnFocus
        />
        {suffix && (
          <Text style={[styles.numberAffix, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { settings, setArtist, setNotification, setPrivacy, resetSettings } = useSettings();
  const [showProvinces, setShowProvinces] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const a = settings.artist;

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    signOut();
    router.replace("/(auth)/welcome");
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetSettings();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: paddingTop + 10,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Settings
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: paddingBottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile summary (read-only) */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.primaryDim,
              borderRadius: colors.radius + 2,
              borderColor: colors.primary + "30",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: colors.primary + "22", borderRadius: 24, borderColor: colors.primary + "40", borderWidth: 2 },
            ]}
          >
            <Text style={[styles.profileAvatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {user?.name?.[0] ?? "?"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user?.name ?? "Your Name"}
            </Text>
            <Text style={[styles.profileHandle, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              {user?.handle ?? "@handle"}
            </Text>
            <View style={[styles.profileRoleBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40", borderRadius: 6 }]}>
              <Text style={[styles.profileRoleText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                {user?.role === "stylist" ? "Artist / Stylist" : "Client"} · {user?.tier ?? "New"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── AVAILABILITY ── */}
        <SectionHeader
          title="Availability"
          subtitle="Control when you can be booked on GlamNet"
        />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="clock"
            label="Available for Bookings"
            sublabel={a.available ? "Visible to clients — you can receive bookings" : "Hidden from discovery — not accepting work"}
            iconColor={a.available ? colors.green : colors.dim}
            value={a.available}
            onChange={(v) => setArtist("available", v)}
          />
          <ToggleRow
            icon="zap"
            label="Instant Book"
            sublabel="Allow clients to book you directly without approval"
            iconColor={colors.accent}
            value={a.instantBook}
            onChange={(v) => setArtist("instantBook", v)}
          />
        </View>

        {/* ── HOUSE CALLS ── */}
        <SectionHeader
          title="House Calls"
          subtitle="Offer on-location services with a transparent call-out fee"
        />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="home"
            label="House Calls Enabled"
            sublabel="Show a house call option on your profile"
            iconColor={colors.primary}
            value={a.houseCallsEnabled}
            onChange={(v) => setArtist("houseCallsEnabled", v)}
          />

          {a.houseCallsEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
              <NumberInput
                label="Base call-out fee"
                value={a.callOutBase}
                onChange={(v) => setArtist("callOutBase", v)}
                prefix="R"
              />
              <NumberInput
                label="Rate per km"
                value={a.callOutRate}
                onChange={(v) => setArtist("callOutRate", v)}
                prefix="R"
                suffix="/km"
              />
              <View style={[styles.callOutPreview, { backgroundColor: colors.accentDim, borderRadius: colors.radius }]}>
                <Feather name="info" size={13} color={colors.accent} />
                <Text style={[styles.callOutPreviewText, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
                  A 10 km trip would cost the client{" "}
                  <Text style={{ fontFamily: "Inter_700Bold" }}>
                    R{(a.callOutBase + a.callOutRate * 10).toLocaleString()}
                  </Text>{" "}
                  on top of your day rate.
                </Text>
              </View>
            </>
          )}

          <ToggleRow
            icon="briefcase"
            label="Studio Available"
            sublabel="Clients can come to your studio or workspace"
            iconColor={colors.purple}
            value={a.studioAvailable}
            onChange={(v) => setArtist("studioAvailable", v)}
          />
        </View>

        {/* ── LOCATION ── */}
        <SectionHeader
          title="Location"
          subtitle="Where you're based — used to match you with nearby jobs"
        />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="map-pin"
            label="Province"
            sublabel={SA_PROVINCES.find((p) => p.id === a.province)?.label ?? a.province}
            iconColor={colors.primary}
            onPress={() => { Haptics.selectionAsync(); setShowProvinces((v) => !v); }}
            right={
              <View style={styles.provinceRight}>
                <Text style={[styles.provinceValue, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {a.province}
                </Text>
                <Feather
                  name={showProvinces ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.dim}
                />
              </View>
            }
          />
          {showProvinces && (
            <View style={[styles.provinceList, { borderTopColor: colors.borderLight }]}>
              {SA_PROVINCES.filter((p) => p.id !== "all").map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.provinceItem,
                    {
                      backgroundColor: a.province === p.id ? colors.primaryDim : "transparent",
                      borderRadius: 8,
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setArtist("province", p.id);
                    setShowProvinces(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.provinceItemText,
                      {
                        color: a.province === p.id ? colors.primary : colors.foreground,
                        fontFamily: a.province === p.id ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                  {a.province === p.id && (
                    <Feather name="check" size={14} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.cityRow, { borderTopColor: colors.borderLight }]}>
            <View style={[styles.cityIconWrap, { backgroundColor: colors.mutedForeground + "16", borderRadius: 9 }]}>
              <Feather name="navigation" size={16} color={colors.mutedForeground} />
            </View>
            <View style={styles.cityTextWrap}>
              <Text style={[styles.cityLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                City / Area
              </Text>
              <TextInput
                value={a.city}
                onChangeText={(t) => setArtist("city", t)}
                placeholder="e.g. Sandton, Cape Town CBD"
                placeholderTextColor={colors.dim}
                style={[styles.cityInput, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
              />
            </View>
          </View>
        </View>

        {/* ── NOTIFICATIONS ── */}
        <SectionHeader
          title="Notifications"
          subtitle="Choose what you want to be alerted about"
        />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="briefcase"
            label="Job Matches"
            sublabel="New jobs that match your skills and location"
            iconColor={colors.primary}
            value={settings.notifications.jobMatches}
            onChange={(v) => setNotification("jobMatches", v)}
          />
          <ToggleRow
            icon="calendar"
            label="Booking Updates"
            sublabel="Confirmations, changes, and cancellations"
            iconColor={colors.purple}
            value={settings.notifications.bookingUpdates}
            onChange={(v) => setNotification("bookingUpdates", v)}
          />
          <ToggleRow
            icon="message-circle"
            label="Messages"
            sublabel="New messages from clients and collaborators"
            iconColor={colors.accent}
            value={settings.notifications.messages}
            onChange={(v) => setNotification("messages", v)}
          />
          <ToggleRow
            icon="users"
            label="Team Invites"
            sublabel="When someone adds you to a creative team"
            iconColor={colors.green}
            value={settings.notifications.teamInvites}
            onChange={(v) => setNotification("teamInvites", v)}
          />
          <ToggleRow
            icon="dollar-sign"
            label="Payments"
            sublabel="Payment received, pending, or failed"
            iconColor={colors.green}
            value={settings.notifications.payments}
            onChange={(v) => setNotification("payments", v)}
          />
          <ToggleRow
            icon="star"
            label="Rep Score Updates"
            sublabel="When your reputation score changes"
            iconColor={colors.accent}
            value={settings.notifications.repUpdates}
            onChange={(v) => setNotification("repUpdates", v)}
          />
          <ToggleRow
            icon="mail"
            label="Marketing & Tips"
            sublabel="GlamNet news, tips, and platform updates"
            iconColor={colors.dim}
            value={settings.notifications.marketing}
            onChange={(v) => setNotification("marketing", v)}
          />
        </View>

        {/* ── PRIVACY ── */}
        <SectionHeader
          title="Privacy"
          subtitle="Control what others can see on your profile"
        />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="eye"
            label="Public Profile"
            sublabel="Discoverable in search and Discover tab"
            iconColor={colors.primary}
            value={settings.privacy.publicProfile}
            onChange={(v) => setPrivacy("publicProfile", v)}
          />
          <ToggleRow
            icon="dollar-sign"
            label="Show Day Rate"
            sublabel="Display your rate on your public profile"
            iconColor={colors.accent}
            value={settings.privacy.showRate}
            onChange={(v) => setPrivacy("showRate", v)}
          />
          <ToggleRow
            icon="map-pin"
            label="Show Location"
            sublabel="Show your city and province to others"
            iconColor={colors.purple}
            value={settings.privacy.showLocation}
            onChange={(v) => setPrivacy("showLocation", v)}
          />
          <ToggleRow
            icon="bar-chart-2"
            label="Show Stats"
            sublabel="Rep score, jobs done, and campaign count"
            iconColor={colors.green}
            value={settings.privacy.showStats}
            onChange={(v) => setPrivacy("showStats", v)}
          />
        </View>

        {/* ── ABOUT ── */}
        <SectionHeader title="About" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="help-circle"
            label="How GlamNet Works"
            sublabel="Learn about verification, tiers, and rep scores"
            iconColor={colors.purple}
            onPress={() => router.push("/how-it-works")}
          />
          <SettingsRow
            icon="shield"
            label="Privacy Policy"
            sublabel="How we handle your data"
            iconColor={colors.accent}
            onPress={() => {}}
          />
          <SettingsRow
            icon="file-text"
            label="Terms of Service"
            iconColor={colors.mutedForeground}
            onPress={() => {}}
          />
          <SettingsRow
            icon="info"
            label="App Version"
            sublabel="GlamNet 1.0.0 (Beta)"
            iconColor={colors.dim}
          />
        </View>

        {/* ── DANGER ZONE ── */}
        <SectionHeader title="Account" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="refresh-cw"
            label="Reset Settings"
            sublabel="Restore all settings to their defaults"
            iconColor={colors.mutedForeground}
            onPress={handleReset}
          />
          <SettingsRow
            icon="log-out"
            label="Sign Out"
            iconColor={colors.destructive}
            destructive
            onPress={handleSignOut}
          />
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, letterSpacing: -0.5 },
  scroll: { padding: 16, gap: 6 },
  profileCard: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  profileAvatar: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  profileAvatarText: { fontSize: 22 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, letterSpacing: -0.4 },
  profileHandle: { fontSize: 13 },
  profileRoleBadge: { paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", borderWidth: 1 },
  profileRoleText: { fontSize: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  sectionHeader: { paddingHorizontal: 4, paddingTop: 10, paddingBottom: 6, gap: 2 },
  sectionTitle: { fontSize: 14, letterSpacing: -0.2 },
  sectionSub: { fontSize: 11, lineHeight: 15 },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  rowIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 14 },
  rowSub: { fontSize: 11, lineHeight: 15 },
  divider: { height: 1, marginHorizontal: 14 },
  numberInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  numberLabel: { fontSize: 14, flex: 1 },
  numberInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
    minWidth: 100,
    justifyContent: "center",
  },
  numberAffix: { fontSize: 13 },
  numberInput: { fontSize: 16, minWidth: 44, textAlign: "center" as const },
  callOutPreview: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    alignItems: "flex-start",
    marginHorizontal: 14,
    marginBottom: 8,
  },
  callOutPreviewText: { fontSize: 12, lineHeight: 17, flex: 1 },
  provinceRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  provinceValue: { fontSize: 13 },
  provinceList: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 2,
  },
  provinceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  provinceItemText: { fontSize: 13 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cityIconWrap: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  cityTextWrap: { flex: 1, gap: 2 },
  cityLabel: { fontSize: 14 },
  cityInput: { fontSize: 13 },
});

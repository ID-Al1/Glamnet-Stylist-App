import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type Notification, type NotifType, useNotifications } from "@/context/NotificationsContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface NotifMeta {
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

function getNotifMeta(type: NotifType, colors: ReturnType<typeof import("@/hooks/useColors").useColors>): NotifMeta {
  switch (type) {
    case "job_match": return { icon: "briefcase", color: colors.primary };
    case "team_invite": return { icon: "users", color: colors.purple };
    case "booking_confirmed": return { icon: "check-circle", color: colors.green };
    case "booking_request": return { icon: "calendar", color: colors.accent };
    case "payment": return { icon: "dollar-sign", color: colors.green };
    case "rep_update": return { icon: "star", color: colors.accent };
    case "system": return { icon: "info", color: colors.blue };
    default: return { icon: "bell", color: colors.mutedForeground };
  }
}

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "job_match", label: "Jobs" },
  { id: "booking_confirmed", label: "Bookings" },
  { id: "payment", label: "Payments" },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "booking_confirmed") return n.type === "booking_confirmed" || n.type === "booking_request";
    return n.type === activeFilter;
  });

  const renderNotif = (notif: Notification) => {
    const meta = getNotifMeta(notif.type, colors);
    return (
      <TouchableOpacity
        key={notif.id}
        activeOpacity={0.8}
        onPress={() => {
          Haptics.selectionAsync();
          markRead(notif.id);
        }}
        style={[
          styles.notifCard,
          {
            backgroundColor: notif.read ? colors.card : colors.primaryDim,
            borderColor: notif.read ? colors.border : colors.primary + "30",
            borderRadius: colors.radius,
          },
        ]}
      >
        {/* Unread dot */}
        {!notif.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}

        <View style={[styles.notifIcon, { backgroundColor: meta.color + "18", borderRadius: 10 }]}>
          <Feather name={meta.icon} size={18} color={meta.color} />
        </View>

        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text
              style={[
                styles.notifTitle,
                {
                  color: colors.foreground,
                  fontFamily: notif.read ? "Inter_500Medium" : "Inter_700Bold",
                },
              ]}
              numberOfLines={1}
            >
              {notif.title}
            </Text>
            <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {timeAgo(notif.timestamp)}
            </Text>
          </View>
          <Text
            style={[styles.notifText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
            numberOfLines={2}
          >
            {notif.body}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            deleteNotification(notif.id);
          }}
          style={styles.deleteBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Feather name="x" size={14} color={colors.dim} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.headerBadgeText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              markAllRead();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.markAllText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, { borderBottomColor: colors.border }]}
      >
        {FILTER_TABS.map((tab) => {
          const count =
            tab.id === "unread"
              ? unreadCount
              : tab.id === "all"
              ? notifications.length
              : notifications.filter((n) =>
                  tab.id === "booking_confirmed"
                    ? n.type === "booking_confirmed" || n.type === "booking_request"
                    : n.type === tab.id
                ).length;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(tab.id); }}
              style={[
                styles.filterTab,
                {
                  borderBottomColor: activeFilter === tab.id ? colors.primary : "transparent",
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: activeFilter === tab.id ? colors.primary : colors.mutedForeground,
                    fontFamily: activeFilter === tab.id ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor:
                        activeFilter === tab.id ? colors.primary : colors.muted,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      {
                        color: activeFilter === tab.id ? "#fff" : colors.mutedForeground,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Notifications list */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: paddingBottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted, borderRadius: 32 }]}>
              <Feather name="bell-off" size={28} color={colors.dim} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {activeFilter === "unread" ? "All caught up!" : "No notifications"}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {activeFilter === "unread"
                ? "You've read all your notifications."
                : "Notifications about jobs, bookings, and payments will appear here."}
            </Text>
          </View>
        ) : (
          <View style={styles.notifList}>
            {/* Today */}
            {filtered.some((n) => Date.now() - n.timestamp < 86400000) && (
              <>
                <Text style={[styles.dayLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  Today
                </Text>
                {filtered
                  .filter((n) => Date.now() - n.timestamp < 86400000)
                  .map(renderNotif)}
              </>
            )}
            {/* Earlier */}
            {filtered.some((n) => Date.now() - n.timestamp >= 86400000) && (
              <>
                <Text style={[styles.dayLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  Earlier
                </Text>
                {filtered
                  .filter((n) => Date.now() - n.timestamp >= 86400000)
                  .map(renderNotif)}
              </>
            )}

            {/* Clear all */}
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.clearAllBtn,
                  { borderColor: colors.border, borderRadius: colors.radius },
                ]}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  clearAll();
                }}
                activeOpacity={0.75}
              >
                <Feather name="trash-2" size={14} color={colors.destructive} />
                <Text style={[styles.clearAllText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
                  Clear all notifications
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, letterSpacing: -0.5 },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  headerBadgeText: { fontSize: 11 },
  markAllText: { fontSize: 12 },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 0,
    borderBottomWidth: 1,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  filterTabText: { fontSize: 13 },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: { fontSize: 10 },
  scroll: { padding: 16 },
  notifList: { gap: 2 },
  dayLabel: {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  notifCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 6,
    alignItems: "flex-start",
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    left: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifBody: { flex: 1, gap: 4 },
  notifTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  notifTitle: { fontSize: 13, flex: 1 },
  notifTime: { fontSize: 11, flexShrink: 0 },
  notifText: { fontSize: 12, lineHeight: 17 },
  deleteBtn: { padding: 2 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyIcon: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17 },
  emptySub: { fontSize: 13, textAlign: "center", paddingHorizontal: 32, lineHeight: 18 },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 16,
  },
  clearAllText: { fontSize: 13 },
});

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfileDrawer } from "@/components/ProfileDrawer";
import { type Thread, useMessaging } from "@/context/MessagingContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(ts: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function MessagesTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { threads, totalUnread, markThreadRead } = useMessaging();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = threads.filter(
    (t) =>
      !search ||
      t.participantName.toLowerCase().includes(search.toLowerCase()) ||
      t.participantRole.toLowerCase().includes(search.toLowerCase())
  );

  const renderThread = ({ item }: { item: Thread }) => {
    const isArtist = item.participantType === "artist";
    const avatarColor = isArtist ? colors.primary : colors.purple;
    const initial = item.participantName[0];

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => {
          Haptics.selectionAsync();
          router.push(`/messages/${item.id}`);
        }}
        style={[
          styles.threadRow,
          {
            backgroundColor: item.unreadCount > 0 ? colors.primaryDim : colors.background,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: avatarColor + "18",
                borderRadius: 22,
                borderColor: avatarColor + "30",
                borderWidth: 1.5,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: avatarColor, fontFamily: "Inter_700Bold" },
              ]}
            >
              {isArtist ? initial : "✦"}
            </Text>
          </View>
          {/* Online dot placeholder */}
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: colors.green, borderColor: colors.background },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.threadContent}>
          <View style={styles.threadTopRow}>
            <Text
              style={[
                styles.threadName,
                {
                  color: colors.foreground,
                  fontFamily: item.unreadCount > 0 ? "Inter_700Bold" : "Inter_600SemiBold",
                },
              ]}
              numberOfLines={1}
            >
              {item.participantName}
            </Text>
            <Text
              style={[
                styles.threadTime,
                {
                  color: item.unreadCount > 0 ? colors.primary : colors.dim,
                  fontFamily: item.unreadCount > 0 ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {timeAgo(item.lastTimestamp)}
            </Text>
          </View>

          <View style={styles.threadMidRow}>
            <Text
              style={[
                styles.threadRole,
                { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
              ]}
              numberOfLines={1}
            >
              {item.participantRole}
            </Text>
          </View>

          <View style={styles.threadBottomRow}>
            <Text
              style={[
                styles.threadPreview,
                {
                  color: item.unreadCount > 0 ? colors.foreground : colors.mutedForeground,
                  fontFamily: item.unreadCount > 0 ? "Inter_500Medium" : "Inter_400Regular",
                  flex: 1,
                },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage || "Start the conversation..."}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text
                  style={[styles.unreadText, { color: "#fff", fontFamily: "Inter_700Bold" }]}
                >
                  {item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {item.bookingContext && (
            <View
              style={[
                styles.contextPill,
                { backgroundColor: colors.accentDim, borderRadius: 5 },
              ]}
            >
              <Feather name="calendar" size={9} color={colors.accent} />
              <Text
                style={[
                  styles.contextText,
                  { color: colors.accent, fontFamily: "Inter_500Medium" },
                ]}
              >
                {item.bookingContext}
              </Text>
            </View>
          )}
        </View>
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
            paddingBottom: 0,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={22} color={colors.foreground} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text
              style={[
                styles.headerTitle,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Messages
            </Text>
            {totalUnread > 0 && (
              <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
                <Text
                  style={[
                    styles.headerBadgeText,
                    { color: "#fff", fontFamily: "Inter_700Bold" },
                  ]}
                >
                  {totalUnread}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Feather name="edit" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.muted,
              borderRadius: colors.radius,
              marginTop: 10,
              marginBottom: 12,
            },
          ]}
        >
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations..."
            placeholderTextColor={colors.dim}
            style={[
              styles.searchInput,
              { color: colors.foreground, fontFamily: "Inter_400Regular" },
            ]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {threads.length === 0 ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.muted, borderRadius: 36 },
            ]}
          >
            <Feather name="message-circle" size={32} color={colors.dim} />
          </View>
          <Text
            style={[
              styles.emptyTitle,
              { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            No messages yet
          </Text>
          <Text
            style={[
              styles.emptySub,
              { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
            ]}
          >
            Open a talent profile and tap the message button to start a conversation.
          </Text>
          <TouchableOpacity
            style={[
              styles.browseBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius },
            ]}
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.82}
          >
            <Text
              style={[
                styles.browseBtnText,
                { color: "#fff", fontFamily: "Inter_700Bold" },
              ]}
            >
              Browse Talent
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderThread}
          contentContainerStyle={{
            paddingBottom:
              insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Text
                style={[
                  styles.noResultsText,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                No conversations match "{search}"
              </Text>
            </View>
          }
        />
      )}

      <ProfileDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: { padding: 4 },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: { fontSize: 20, letterSpacing: -0.5 },
  headerBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  headerBadgeText: { fontSize: 11 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  threadRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    alignItems: "flex-start",
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  threadContent: { flex: 1, gap: 2 },
  threadTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  threadName: { fontSize: 14, flex: 1 },
  threadTime: { fontSize: 11, marginLeft: 6 },
  threadMidRow: {},
  threadRole: { fontSize: 11 },
  threadBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  threadPreview: { fontSize: 13 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  unreadText: { fontSize: 10 },
  contextPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  contextText: { fontSize: 10 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18 },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 8,
  },
  browseBtnText: { fontSize: 15 },
  noResults: { padding: 32, alignItems: "center" },
  noResultsText: { fontSize: 13 },
});

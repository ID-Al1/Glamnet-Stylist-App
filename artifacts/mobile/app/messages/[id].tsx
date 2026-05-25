import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ALL_TALENT } from "@/constants/data";
import { useMessaging } from "@/context/MessagingContext";
import { useColors } from "@/hooks/useColors";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hrs = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${hrs}:${mins}`;
}

function formatDateDivider(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { weekday: "long", month: "short", day: "numeric" });
}

const QUICK_REPLIES = [
  "Sounds great! 👍",
  "Can you share your rate card?",
  "I'll send the mood board shortly.",
  "What's your availability?",
  "Let's confirm by Friday.",
];

const AUTO_REPLIES: Record<string, string[]> = {
  default: [
    "That works for me! Let me check my schedule.",
    "Thanks for reaching out! Happy to discuss further.",
    "Sounds exciting — tell me more about the brief.",
    "I can do that. What's the vibe for the shoot?",
  ],
};

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { threads, messages, sendMessage, markThreadRead } = useMessaging();
  const [input, setInput] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const listRef = useRef<FlatList>(null);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);
  const paddingBottom = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const thread = threads.find((t) => t.id === id);
  const msgs = messages[id ?? ""] ?? [];
  const talent = ALL_TALENT.find((t) => t.id === thread?.participantId);

  useEffect(() => {
    if (id) markThreadRead(id);
  }, [id, markThreadRead]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [msgs.length]);

  if (!thread) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.navBar, { paddingTop: paddingTop + 10, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundState}>
          <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Conversation not found
          </Text>
        </View>
      </View>
    );
  }

  const isArtist = thread.participantType === "artist";
  const accentColor = isArtist ? colors.primary : colors.purple;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    Haptics.selectionAsync();
    sendMessage(id!, text);
    setInput("");
    setShowQuickReplies(false);

    // Simulate reply after a delay
    const delay = 1500 + Math.random() * 2000;
    setTimeout(() => {
      const replies = AUTO_REPLIES.default;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      sendMessage(id!, `[${thread.participantName.split(" ")[0]}]: ${reply}`);
    }, delay);
  };

  const handleQuickReply = (text: string) => {
    Haptics.selectionAsync();
    sendMessage(id!, text);
    setShowQuickReplies(false);
  };

  // Group messages by date
  type ListItem =
    | { type: "divider"; label: string; key: string }
    | { type: "message"; msg: (typeof msgs)[number]; key: string };

  const listItems: ListItem[] = [];
  let lastDateLabel = "";
  for (const msg of msgs) {
    const label = formatDateDivider(msg.timestamp);
    if (label !== lastDateLabel) {
      listItems.push({ type: "divider", label, key: `div_${msg.id}` });
      lastDateLabel = label;
    }
    listItems.push({ type: "message", msg, key: msg.id });
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "divider") {
      return (
        <View style={styles.dateDivider}>
          <View style={[styles.dateLine, { backgroundColor: colors.borderLight }]} />
          <Text
            style={[
              styles.dateDividerText,
              { color: colors.dim, fontFamily: "Inter_400Regular" },
            ]}
          >
            {item.label}
          </Text>
          <View style={[styles.dateLine, { backgroundColor: colors.borderLight }]} />
        </View>
      );
    }

    const { msg } = item;
    const isMe = msg.senderId === "me";
    // Strip auto-reply prefix if present
    const displayText = msg.text.startsWith(`[${thread.participantName.split(" ")[0]}]: `)
      ? msg.text.replace(`[${thread.participantName.split(" ")[0]}]: `, "")
      : msg.text;

    return (
      <View
        style={[
          styles.bubbleRow,
          { justifyContent: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        {!isMe && (
          <View
            style={[
              styles.bubbleAvatar,
              {
                backgroundColor: accentColor + "18",
                borderRadius: 16,
                borderColor: accentColor + "30",
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.bubbleAvatarText,
                { color: accentColor, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {isArtist ? thread.participantName[0] : "✦"}
            </Text>
          </View>
        )}
        <View style={[styles.bubbleWrap, { maxWidth: "72%" }]}>
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isMe ? colors.primary : colors.card,
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                borderColor: isMe ? "transparent" : colors.border,
                borderWidth: isMe ? 0 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                {
                  color: isMe ? "#fff" : colors.foreground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {displayText}
            </Text>
          </View>
          <Text
            style={[
              styles.bubbleTime,
              {
                color: colors.dim,
                fontFamily: "Inter_400Regular",
                alignSelf: isMe ? "flex-end" : "flex-start",
              },
            ]}
          >
            {formatTime(msg.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.navBar,
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

        {/* Participant info */}
        <TouchableOpacity
          style={styles.navParticipant}
          onPress={() => talent && router.push(`/talent/${talent.id}`)}
          activeOpacity={0.82}
        >
          <View
            style={[
              styles.navAvatar,
              {
                backgroundColor: accentColor + "18",
                borderRadius: 18,
                borderColor: accentColor + "30",
                borderWidth: 1.5,
              },
            ]}
          >
            <Text style={[styles.navAvatarText, { color: accentColor, fontFamily: "Inter_700Bold" }]}>
              {isArtist ? thread.participantName[0] : "✦"}
            </Text>
          </View>
          <View style={styles.navInfo}>
            <Text
              style={[
                styles.navName,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              {thread.participantName}
            </Text>
            <View style={styles.navSubRow}>
              <View style={[styles.onlineDot, { backgroundColor: colors.green }]} />
              <Text
                style={[
                  styles.navRole,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
                numberOfLines={1}
              >
                {thread.participantRole}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.navActions}>
          {talent && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                router.push(`/book/${talent.id}`);
              }}
              style={[
                styles.bookBadge,
                { backgroundColor: accentColor + "15", borderRadius: 8, borderColor: accentColor + "30", borderWidth: 1 },
              ]}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={12} color={accentColor} />
              <Text style={[styles.bookBadgeText, { color: accentColor, fontFamily: "Inter_600SemiBold" }]}>
                Book
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
            <Feather name="more-vertical" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking context banner */}
      {thread.bookingContext && (
        <View
          style={[
            styles.contextBanner,
            {
              backgroundColor: colors.accentDim,
              borderBottomColor: colors.accent + "30",
            },
          ]}
        >
          <Feather name="calendar" size={12} color={colors.accent} />
          <Text
            style={[
              styles.contextBannerText,
              { color: colors.accent, fontFamily: "Inter_500Medium" },
            ]}
          >
            {thread.bookingContext}
          </Text>
          <TouchableOpacity
            onPress={() => talent && router.push(`/book/${talent.id}`)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.contextBannerLink,
                { color: colors.accent, fontFamily: "Inter_700Bold" },
              ]}
            >
              View booking →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "web" ? 0 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={listItems}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.msgList,
            { paddingBottom: 16 },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View
                style={[
                  styles.emptyChatIcon,
                  {
                    backgroundColor: accentColor + "12",
                    borderRadius: 32,
                    borderColor: accentColor + "20",
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 28 }}>
                  {isArtist ? thread.participantName[0] : "✦"}
                </Text>
              </View>
              <Text
                style={[
                  styles.emptyChatName,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                {thread.participantName}
              </Text>
              <Text
                style={[
                  styles.emptyChatRole,
                  { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                ]}
              >
                {thread.participantRole}
              </Text>
              <Text
                style={[
                  styles.emptyChatHint,
                  { color: colors.dim, fontFamily: "Inter_400Regular" },
                ]}
              >
                Send a message to start the conversation
              </Text>
            </View>
          }
        />

        {/* Quick replies */}
        {showQuickReplies && (
          <View
            style={[
              styles.quickReplies,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.borderLight,
              },
            ]}
          >
            {QUICK_REPLIES.map((qr) => (
              <TouchableOpacity
                key={qr}
                onPress={() => handleQuickReply(qr)}
                activeOpacity={0.8}
                style={[
                  styles.quickReplyBtn,
                  {
                    backgroundColor: colors.muted,
                    borderRadius: 16,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quickReplyText,
                    { color: colors.foreground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {qr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input bar */}
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: paddingBottom + 8,
              paddingHorizontal: 12,
              paddingTop: 10,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowQuickReplies((v) => !v);
            }}
            style={[
              styles.inputAction,
              {
                backgroundColor: showQuickReplies ? colors.primaryDim : colors.muted,
                borderRadius: 22,
              },
            ]}
            activeOpacity={0.75}
          >
            <Feather
              name="zap"
              size={16}
              color={showQuickReplies ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 22,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={`Message ${thread.participantName.split(" ")[0]}...`}
              placeholderTextColor={colors.dim}
              multiline
              style={[
                styles.input,
                { color: colors.foreground, fontFamily: "Inter_400Regular" },
              ]}
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() ? colors.primary : colors.muted,
                borderRadius: 22,
              },
            ]}
            activeOpacity={0.82}
          >
            <Feather name="send" size={16} color={input.trim() ? "#fff" : colors.dim} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFoundState: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 15 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  navParticipant: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  navAvatar: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navAvatarText: { fontSize: 15 },
  navInfo: { flex: 1, gap: 1 },
  navName: { fontSize: 15, letterSpacing: -0.2 },
  navSubRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  navRole: { fontSize: 11 },
  navActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  bookBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bookBadgeText: { fontSize: 11 },
  moreBtn: { padding: 4 },
  contextBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexWrap: "wrap" as const,
  },
  contextBannerText: { fontSize: 12, flex: 1 },
  contextBannerLink: { fontSize: 12 },
  msgList: { paddingHorizontal: 12, paddingTop: 12, gap: 4 },
  dateDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
  },
  dateLine: { flex: 1, height: 1 },
  dateDividerText: { fontSize: 11 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginVertical: 2 },
  bubbleAvatar: { width: 28, height: 28, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubbleAvatarText: { fontSize: 12 },
  bubbleWrap: { gap: 2 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10 },
  emptyChat: { paddingTop: 60, alignItems: "center", gap: 8, padding: 24 },
  emptyChatIcon: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  emptyChatName: { fontSize: 18, letterSpacing: -0.3, marginTop: 8 },
  emptyChatRole: { fontSize: 13 },
  emptyChatHint: { fontSize: 12, marginTop: 8, textAlign: "center" },
  quickReplies: {
    flexDirection: "row",
    flexWrap: "wrap" as const,
    gap: 6,
    padding: 10,
    borderTopWidth: 1,
  },
  quickReplyBtn: { paddingHorizontal: 12, paddingVertical: 7 },
  quickReplyText: { fontSize: 12 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, borderTopWidth: 1 },
  inputAction: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  inputWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    maxHeight: 100,
  },
  input: { fontSize: 15, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});

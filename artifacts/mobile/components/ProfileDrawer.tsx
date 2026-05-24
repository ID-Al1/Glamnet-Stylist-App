import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TIER_COLORS } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ visible, onClose }: ProfileDrawerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -DRAWER_WIDTH,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity]);

  const handleSignOut = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onClose();
    await signOut();
    router.replace("/(auth)/welcome");
  }, [onClose, signOut]);

  const tierColor = user ? (TIER_COLORS[user.tier] ?? colors.mutedForeground) : colors.mutedForeground;

  if (!user) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.container]}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Overlay */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
      >
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(28,20,16,0.55)" }]}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.card,
            transform: [{ translateX }],
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.appName, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              GlamNet
            </Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Creative Collective
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Profile section */}
        <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primaryDim, borderRadius: 28 }]}>
            <Text style={[styles.profileAvatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {user.name[0]}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user.name}
            </Text>
            <Text style={[styles.profileHandle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {user.handle}
            </Text>
            <View style={styles.profileBadges}>
              <View style={[styles.roleBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                <Text style={[styles.roleBadgeText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                  {user.role === "stylist" ? "Stylist" : "Client"}
                </Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: tierColor + "18", borderColor: tierColor + "40" }]}>
                <Text style={[styles.roleBadgeText, { color: tierColor, fontFamily: "Inter_600SemiBold" }]}>
                  {user.tier}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user.jobs}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Jobs
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {user.repScore}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Rep Score
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
              R{user.earnings.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Earned
            </Text>
          </View>
        </View>

        {/* Nav items */}
        <View style={styles.navItems}>
          {[
            { icon: "user" as const, label: "My Profile", sub: "View and edit your profile" },
            { icon: "settings" as const, label: "Settings", sub: "Account & preferences" },
            { icon: "help-circle" as const, label: "Help & Support", sub: "Get assistance" },
            { icon: "star" as const, label: "Rate the App", sub: "Share your feedback" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, { borderBottomColor: colors.borderLight }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync();
                onClose();
              }}
            >
              <View style={[styles.navIconWrap, { backgroundColor: colors.muted, borderRadius: 10 }]}>
                <Feather name={item.icon} size={16} color={colors.mutedForeground} />
              </View>
              <View style={styles.navText}>
                <Text style={[styles.navLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.label}
                </Text>
                <Text style={[styles.navSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.sub}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.dim} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          onPress={handleSignOut}
          activeOpacity={0.75}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  appName: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  profileSection: {
    flexDirection: "row",
    gap: 14,
    padding: 20,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  profileAvatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  profileHandle: {
    fontSize: 12,
  },
  profileBadges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    flex: 1,
    gap: 1,
  },
  navLabel: {
    fontSize: 14,
  },
  navSub: {
    fontSize: 11,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 14,
  },
});

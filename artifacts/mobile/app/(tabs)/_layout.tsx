import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useMessaging } from "@/context/MessagingContext";
import { useAuth } from "@/context/AuthContext";

function UnreadBadge({ count }: { count: number }) {
  const colors = useColors();
  if (count === 0) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: -4,
        right: -6,
        minWidth: 15,
        height: 15,
        borderRadius: 8,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
        zIndex: 10,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" }}>
        {count > 9 ? "9+" : count}
      </Text>
    </View>
  );
}

function NativeTabLayout({ role }: { role: "client" | "stylist" | "brand" | null }) {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "sparkles", selected: "sparkles" }} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      {(role === "stylist" || role === "brand") && (
        <NativeTabs.Trigger name="teams">
          <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
          <Label>Teams</Label>
        </NativeTabs.Trigger>
      )}
      {role === "stylist" && (
        <NativeTabs.Trigger name="earn">
          <Icon sf={{ default: "banknote", selected: "banknote.fill" }} />
          <Label>Appointments</Label>
        </NativeTabs.Trigger>
      )}
      {role === "brand" && (
        <NativeTabs.Trigger name="castings">
          <Icon sf={{ default: "briefcase", selected: "briefcase.fill" }} />
          <Label>Castings</Label>
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="messages">
        <Icon sf={{ default: "message", selected: "message.fill" }} />
        <Label>Messages</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dashboard">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout({ role }: { role: "client" | "stylist" | "brand" | null }) {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { totalUnread } = useMessaging();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_500Medium",
          marginBottom: isWeb ? 0 : 2,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 60,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="sparkles" tintColor={color} size={22} />
            ) : (
              <Feather name="compass" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "Teams",
          href: role === "client" ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.3" tintColor={color} size={22} />
            ) : (
              <Feather name="users" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="earn"
        options={{
          title: "Appointments",
          href: role !== "stylist" ? null : undefined,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="banknote" tintColor={color} size={22} />
            ) : (
              <Feather name="dollar-sign" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="castings"
        options={{
          title: "Castings",
          href: role === "brand" ? undefined : null,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="briefcase" tintColor={color} size={22} />
            ) : (
              <Feather name="briefcase" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <View style={{ position: "relative" }}>
              {isIOS ? (
                <SymbolView name="message" tintColor={color} size={22} />
              ) : (
                <Feather name="message-circle" size={20} color={color} />
              )}
              <UnreadBadge count={totalUnread} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar" tintColor={color} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={20} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout role={role} />;
  }
  return <ClassicTabLayout role={role} />;
}

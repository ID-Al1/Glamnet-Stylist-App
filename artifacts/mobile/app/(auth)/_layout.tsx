import { Stack } from "expo-router";
import React from "react";
import { useColors } from "@/hooks/useColors";

export default function AuthLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

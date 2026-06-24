import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  Fraunces_400Regular,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ApplicationsProvider } from "@/context/ApplicationsContext";
import { BookingProvider } from "@/context/BookingContext";
import { JobsProvider } from "@/context/JobsContext";
import { PostingsProvider } from "@/context/PostingsContext";
import { TalentProvider } from "@/context/TalentContext";
import { TeamsProvider } from "@/context/TeamsContext";
import { PortfolioProvider } from "@/context/PortfolioContext";
import { PaymentProvider } from "@/context/PaymentContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F9F6F2", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#C4526E" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="talent/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="team-builder"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="verification"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="payment"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="castings"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="career-insights"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="upgrade-pro"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="learn"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="platform-stats"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="how-it-works"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="jobs/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="post-job"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="my-castings"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="my-castings/[id]"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="home"
          options={{ headerShown: false, presentation: "card" }}
        />
        <Stack.Screen
          name="portfolio-editor"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="book-team/[id]"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="profile"
          options={{ headerShown: false, presentation: "card" }}
        />
      </Stack>
    </AuthGuard>
  );
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <PostingsProvider>
          <JobsProvider>
            <TalentProvider>
              <ApplicationsProvider>
                <BookingProvider>
                  <TeamsProvider>
                    <PortfolioProvider>
                      <PaymentProvider>
                      <NotificationsProvider>
                        <MessagingProvider>
                          {children}
                        </MessagingProvider>
                      </NotificationsProvider>
                      </PaymentProvider>
                    </PortfolioProvider>
                  </TeamsProvider>
                </BookingProvider>
              </ApplicationsProvider>
            </TalentProvider>
          </JobsProvider>
        </PostingsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_400Regular,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const inner = Platform.OS === "web" ? (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  ) : (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppProviders>
          <RootLayoutNav />
        </AppProviders>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {inner}
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

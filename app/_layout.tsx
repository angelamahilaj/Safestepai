import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DeviceProvider } from "@/contexts/DeviceContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent hiding splash until app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="medical-info" />
      <Stack.Screen name="vision" />
      <Stack.Screen name="text-reader" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="location" />
      <Stack.Screen name="navigation" />
      <Stack.Screen name="health" />
      <Stack.Screen
        name="emergency"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Ensures splash hides safely even if something throws
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 200);
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AccessibilityProvider>
              <DeviceProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </DeviceProvider>
            </AccessibilityProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

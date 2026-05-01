import { NetworkBanner } from "@/components/NetworkBanner";
import { Theme } from "@/constants/Theme";
import { AppInitializationService } from "@/lib/application/services/AppInitializationService";
import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";
import { WebViewWorker } from "@/lib/infrastructure/components/WebViewWorker";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RootInner() {
  const [ready, setReady] = useState(false);
  const { isInternetReachable } = useNetworkStatus();
  const appInitService = AppInitializationService.getInstance();

  useEffect(() => {
    let cancelled = false;

    appInitService.initialize()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((error) => {
        console.error('[RootLayout] Initialization failed:', error);
        if (!cancelled) setReady(true); // Set ready even on error to show the app
      });

    return () => {
      cancelled = true;
    };
  }, [appInitService]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.colors.background }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
      {/* Blocking modal when offline */}
      <NetworkBanner visible={!isInternetReachable} />
      {/* Translucent status bar for edge-to-edge */}
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Theme.colors.background },
        statusBarStyle: 'light',
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="anime/[slug]" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
            statusBarHidden: true,
          }}
        />
      </Stack>
      <WebViewWorker />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootInner />
    </SafeAreaProvider>
  );
}

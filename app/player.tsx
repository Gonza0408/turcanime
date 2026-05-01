import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Theme } from "@/constants/Theme";
import { NavigationService } from "@/lib/application/services/NavigationService";
import { PlayerUIService } from "@/lib/application/services/PlayerUIService";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useUserStore } from "@/lib/store/userStore";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function PlayerContent() {
  const { slug, number, title: pTitle, img: pImg } = useLocalSearchParams();
  const { streamUrl, streamHeaders, reset: clearStream } = usePlayerStore();
  const { addToHistory } = useUserStore();

  const playerService = useMemo(() => new PlayerUIService(), []);
  const navigationService = useMemo(() => NavigationService.getInstance(), []);

  // Immersive orientation
  useEffect(() => {
    playerService.setupImmersiveMode();

    return () => {
      playerService.cleanupImmersiveMode();
      clearStream();
    };
  }, [clearStream]);

  // Save to history
  useEffect(() => {
    if (streamUrl && pTitle && pImg) {
      navigationService.saveToHistory({
        title: pTitle as string,
        image: pImg as string,
        url: slug as string,
        number: number as string,
      });
    }
  }, [streamUrl, pTitle, pImg, slug, number]);

  // Video player - initialized directly with URL
  const videoSource = streamUrl
    ? { uri: streamUrl, headers: streamHeaders ?? undefined }
    : null;

  const player = useVideoPlayer(videoSource, (instance) => {
    if (videoSource) {
      instance.loop = false;
      instance.play();
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {streamUrl ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          nativeControls
          buttonOptions={{ showSettings: false, showSubtitles: false }}
        />
      ) : (
        <View style={styles.loadingArea}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  loadingArea: { flex: 1, justifyContent: "center", alignItems: "center" }
});

export default function NativePlayer() {
  return (
    <ErrorBoundary>
      <PlayerContent />
    </ErrorBoundary>
  );
}

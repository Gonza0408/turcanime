import { WithErrorBoundary } from "@/components/WithErrorBoundary";
import { Theme } from "@/constants/Theme";
import { useServices } from "@/lib/hooks/useServices";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useUserStore } from "@/lib/store/userStore";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function PlayerContent() {
  const { slug, number, title, image } = useLocalSearchParams();
  const { streamUrl, streamHeaders, reset: clearStream } = usePlayerStore();
  const { addToHistory } = useUserStore();
  const { playerUIService } = useServices();

  // Immersive orientation
  useEffect(() => {
    playerUIService.setupImmersiveMode();

    return () => {
      playerUIService.cleanupImmersiveMode();
      clearStream();
    };
  }, [clearStream, playerUIService]);

  // Save to history when stream is ready
  useEffect(() => {
    if (streamUrl && title && image) {
      playerUIService.saveToHistory(
        {
          title: title as string,
          image: image as string,
          url: slug as string,
          number: number as string,
        },
        addToHistory
      ).catch(error => {
        console.error("Failed to save to history:", error);
      });
    }
  }, [streamUrl, title, image, slug, number, playerUIService, addToHistory]);

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
    <WithErrorBoundary>
      <PlayerContent />
    </WithErrorBoundary>
  );
}

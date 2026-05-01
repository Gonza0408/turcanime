import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Theme } from "../../constants/Theme";
import { AnimatedPressable } from "../AnimatedPressable";
import { ThemedText } from "./ThemedText";

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
}

export function ErrorState({ onRetry, title = "Error al cargar" }: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Feather name="alert-circle" size={48} color={Theme.colors.text.muted} />
      <ThemedText variant="h3" color="muted" style={styles.errorTitle}>
        {title}
      </ThemedText>
      <AnimatedPressable style={styles.retryButton} onPress={onRetry}>
        <Feather name="refresh-cw" size={16} color={Theme.colors.primary} />
        <ThemedText variant="caption" color="accent" style={styles.retryText}>
          Reintentar
        </ThemedText>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  errorTitle: {
    marginTop: Theme.spacing.sm,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  },
  retryText: {
    marginLeft: Theme.spacing.sm,
  },
});

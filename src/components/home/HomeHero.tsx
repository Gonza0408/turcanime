import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Theme } from "../../constants/Theme";
import { Anime } from "../../lib/domain/entities";
import { navigateToAnime } from "../../lib/utils/navigation";
import { AnimatedPressable } from "../AnimatedPressable";
import { ImageWithLoader } from "../ui/ImageWithLoader";
import { ThemedText } from "../ui/ThemedText";

interface HomeHeroProps {
  featured: Anime | undefined;
}

export const HomeHero = memo(({ featured }: HomeHeroProps) => {
  const { width } = useWindowDimensions();
  const HERO_HEIGHT = width * Theme.dimensions.ratios.hero;

  if (!featured) return null;
  const viewFeatured = () => navigateToAnime(featured.url);

  return (
    <AnimatedPressable
      style={[styles.hero, { height: HERO_HEIGHT }]}
      onPress={viewFeatured}
    >
      <ImageWithLoader
        uri={featured.image}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={Theme.colors.overlay.homeHero}
        locations={[0.05, 0.4, 0.75, 1]}
        style={styles.overlay}
      >
        <ThemedText variant="h1" numberOfLines={3} style={styles.title}>
          {featured.title}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    overflow: "hidden",
    marginBottom: Theme.spacing.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingHorizontal: Theme.edge.horizontal,
    paddingBottom: Theme.spacing.xl,
  },
  title: {
    color: Theme.colors.text.primary,
  },
});

HomeHero.displayName = "HomeHero";



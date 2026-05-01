import { useEffect, useMemo } from "react";
import { Anime, HistoryItem } from "../domain/entities";
import { useAnimeStore } from "../store/animeStore";
import { useUserStore } from "../store/userStore";

export type SectionItem =
  | { type: "HERO"; data: Anime }
  | { type: "CONTINUE"; items: HistoryItem[] }
  | { type: "SECTION"; label: string; items: Anime[] };

const SECTION_LABELS = {
  recent: "Recién agregados",
  popular: "Populares",
  topViewed: "Más vistos",
};

function buildSections(
  homeData: { popular?: Anime[]; recent?: Anime[]; topViewed?: Anime[] },
  heroSource: Anime | undefined,
  continueWatchingItems: HistoryItem[]
): SectionItem[] {
  return [
    ...(heroSource ? [{ type: "HERO" as const, data: heroSource }] : []),
    ...(continueWatchingItems.length > 0 ? [{ type: "CONTINUE" as const, items: continueWatchingItems }] : []),
    ...(homeData.recent && homeData.recent.length > 0 ? [{ type: "SECTION" as const, label: SECTION_LABELS.recent, items: homeData.recent }] : []),
    ...(homeData.popular && homeData.popular.length > 0 ? [{ type: "SECTION" as const, label: SECTION_LABELS.popular, items: homeData.popular }] : []),
    ...(homeData.topViewed && homeData.topViewed.length > 0 ? [{ type: "SECTION" as const, label: SECTION_LABELS.topViewed, items: homeData.topViewed }] : []),
  ];
}

export function useHomeScreen() {
  const { fetchHome, homeData, isHomeLoading, error } = useAnimeStore();
  const { continueWatching, isInitialized, cacheInvalidationTimestamp } = useUserStore();

  useEffect(() => {
    if (cacheInvalidationTimestamp > 0) {
      fetchHome();
    }
  }, [cacheInvalidationTimestamp, fetchHome]);

  const sections = useMemo(() => {
    const heroSource = homeData.popular?.[0];
    return buildSections(homeData, heroSource, continueWatching);
  }, [homeData, continueWatching]);

  const isLoading = isHomeLoading || !isInitialized;

  return {
    sections,
    isLoading,
    error,
    fetchHome,
    hasContent: sections.length > 0,
  };
}

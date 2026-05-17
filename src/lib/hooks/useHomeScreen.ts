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
};

function buildSections(
  homeData: { recent?: Anime[] },
  heroSource: Anime | undefined,
  continueWatchingItems: HistoryItem[]
): SectionItem[] {
  return [
    ...(heroSource ? [{ type: "HERO" as const, data: heroSource }] : []),
    ...(continueWatchingItems.length > 0 ? [{ type: "CONTINUE" as const, items: continueWatchingItems }] : []),
    ...(homeData.recent && homeData.recent.length > 0 ? [{ type: "SECTION" as const, label: SECTION_LABELS.recent, items: homeData.recent }] : []),
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
    const heroSource = homeData.recent?.[0];
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

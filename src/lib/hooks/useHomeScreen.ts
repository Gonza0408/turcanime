import { useEffect, useMemo } from "react";
import { Anime, HistoryItem } from "../domain/entities";
import { useAnimeStore } from "../store/animeStore";
import { useUserStore } from "../store/userStore";

export type SectionItem =
  | { type: "CONTINUE"; items: HistoryItem[] }
  | { type: "SECTION"; label: string; items: Anime[] };

const SECTION_LABELS = {
  recent: "Recién agregados",
};

function buildSections(
  homeData: { recent?: Anime[] },
  continueWatchingItems: HistoryItem[]
): SectionItem[] {
  return [
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
    return buildSections(homeData, continueWatching);
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

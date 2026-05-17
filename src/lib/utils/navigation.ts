/**
 * Navigation utilities — centralizes routing calls to avoid
 * scattered `router.push()` across components.
 */
import { router } from "expo-router";
import { Routes } from "./routes";

export function navigateToAnime(slug: string) {
  router.push(Routes.ANIME(slug));
}

export function navigateToPlayer(params: {
  slug: string;
  number: string;
  title: string;
  image: string;
}) {
  router.push({
    pathname: Routes.PLAYER,
    params,
  });
}

export function navigateBack() {
  router.back();
}

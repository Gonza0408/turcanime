export const Routes = {
  HOME: "/(tabs)/index",
  SEARCH: "/(tabs)/search",
  ANIME: (slug: string) => `/anime/${slug}` as const,
  PLAYER: "/player",
};

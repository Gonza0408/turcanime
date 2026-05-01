import { getDeps } from "../../di";
import { CacheRepo } from "../../domain/repositories/cacheRepo";

const cache = CacheRepo.getInstance(getDeps().storage);

const PRESERVED_KEYS = [
  "scraper_session",
  "last_viewed",
  "recent_searches",
  "episode_order",
];

export async function clearAllCache(): Promise<void> {
  await cache.clearAll(PRESERVED_KEYS);
}

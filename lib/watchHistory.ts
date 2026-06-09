import type { Movie } from "@/types/api";

export interface WatchHistoryItem {
  slug: string;
  name: string;
  origin_name: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  country?: string;
  episodeName?: string;
  currentServerIndex: number;
  currentEpisodeIndex: number;
  watchedAt: number; // timestamp
}

const STORAGE_KEY = "movie_watch_history";
const MAX_HISTORY = 50;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getWatchHistory(): WatchHistoryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WatchHistoryItem[];
  } catch {
    return [];
  }
}

export function saveWatchHistory(
  movie: Pick<Movie, "slug" | "name" | "origin_name" | "poster_url" | "thumb_url" | "year" | "country">,
  episodeName: string,
  currentServerIndex: number,
  currentEpisodeIndex: number
): void {
  if (!isBrowser()) return;
  try {
    const history = getWatchHistory();

    // Remove existing entry for this movie (to move it to front)
    const filtered = history.filter((item) => item.slug !== movie.slug);

    const newItem: WatchHistoryItem = {
      slug: movie.slug,
      name: movie.name,
      origin_name: movie.origin_name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      year: movie.year,
      country: movie.country?.[0]?.name,
      episodeName,
      currentServerIndex,
      currentEpisodeIndex,
      watchedAt: Date.now(),
    };

    // Add to front, limit to MAX_HISTORY
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

export function removeFromHistory(slug: string): void {
  if (!isBrowser()) return;
  try {
    const history = getWatchHistory();
    const filtered = history.filter((item) => item.slug !== slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Silently fail
  }
}

export function clearWatchHistory(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

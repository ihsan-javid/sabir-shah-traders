import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "sst_recently_viewed_v1";
const MAX = 6;
let slugs = [];
const listeners = new Set();

const load = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) slugs = JSON.parse(raw);
  } catch {
    /* noop */
  }
};

const persist = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(slugs));
  listeners.forEach((l) => l());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const trackView = (slug) => {
  load();
  slugs = [slug, ...slugs.filter((s) => s !== slug)].slice(0, MAX);
  persist();
};

export function useRecentlyViewed() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    load();
    setHydrated(true);
    listeners.forEach((l) => l());
  }, []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => slugs,
    () => slugs
  );
  return hydrated ? snapshot : [];
}

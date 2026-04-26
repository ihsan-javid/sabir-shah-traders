import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "sst_reviews_v1";
let reviews = [];
const listeners = new Set();

const load = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) reviews = JSON.parse(raw);
  } catch {
    /* noop */
  }
};

const persist = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(reviews));
  listeners.forEach((l) => l());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const reviewActions = {
  add(input) {
    const newReview = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    reviews = [newReview, ...reviews];
    persist();
    return newReview;
  },
  remove(id) {
    reviews = reviews.filter((r) => r.id !== id);
    persist();
  },
};

export function useReviews(productSlug) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    load();
    setHydrated(true);
    listeners.forEach((l) => l());
  }, []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => reviews,
    () => reviews
  );
  const safe = hydrated ? snapshot : [];
  const filtered = productSlug ? safe.filter((r) => r.productSlug === productSlug) : safe;
  const avg = filtered.length
    ? filtered.reduce((s, r) => s + r.rating, 0) / filtered.length
    : 0;
  return { reviews: filtered, all: safe, avg, count: filtered.length, ...reviewActions };
}

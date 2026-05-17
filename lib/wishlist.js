import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "sst_wishlist_v1";
let items = [];
const listeners = new Set();

const load = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    /* noop */
  }
};

const persist = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const wishlistActions = {
  toggle(product) {
    const index = items.findIndex((p) => p._id === product._id);
    if (index >= 0) {
      items = items.filter((p) => p._id !== product._id);
      persist();
      return false; // Removed
    } else {
      items = [...items, product];
      persist();
      return true; // Added
    }
  },
  isLiked(id) {
    return items.some((p) => p._id === id);
  },
  clear() {
    items = [];
    persist();
  },
};

export function useWishlist() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    load();
    setHydrated(true);
    listeners.forEach((l) => l());
  }, []);

  const snapshot = useSyncExternalStore(
    subscribe,
    () => items,
    () => items
  );

  const safe = hydrated ? snapshot : [];
  
  const has = (id) => safe.some(p => p._id === id);

  return { items: safe, has, ...wishlistActions };
}

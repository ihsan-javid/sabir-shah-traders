import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "sst_cart_v1";
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

export const cartActions = {
  add(product, qty = 1) {
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) existing.qty += qty;
    else items = [...items, { product, qty }];
    persist();
  },
  remove(id) {
    items = items.filter((i) => i.product.id !== id);
    persist();
  },
  setQty(id, qty) {
    items = items
      .map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, qty) } : i))
      .filter((i) => i.qty > 0);
    persist();
  },
  clear() {
    items = [];
    persist();
  },
};

export function useCart() {
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
  const total = safe.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = safe.reduce((s, i) => s + i.qty, 0);
  return { items: safe, total, count, ...cartActions };
}

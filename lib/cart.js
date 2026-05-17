import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "sst_cart_v1";
const BUYNOW_KEY = "sst_buynow_v1";
let items = [];
let buyNowItem = null;
const listeners = new Set();

const load = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw);
    
    const rawBuyNow = localStorage.getItem(BUYNOW_KEY);
    if (rawBuyNow) buyNowItem = JSON.parse(rawBuyNow);
  } catch {
    /* noop */
  }
};

const persist = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  if (buyNowItem) {
    localStorage.setItem(BUYNOW_KEY, JSON.stringify(buyNowItem));
  } else {
    localStorage.removeItem(BUYNOW_KEY);
  }
  listeners.forEach((l) => l());
};

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const cartActions = {
  add(product, qty = 1) {
    const existing = items.find((i) => i.product._id === product._id);
    if (existing) existing.qty += qty;
    else items = [...items, { product, qty }];
    persist();
  },
  remove(id) {
    items = items.filter((i) => i.product._id !== id);
    persist();
  },
  setQty(id, qty) {
    items = items
      .map((i) => (i.product._id === id ? { ...i, qty: Math.max(1, qty) } : i))
      .filter((i) => i.qty > 0);
    persist();
  },
  clear() {
    items = [];
    persist();
  },
  buyNow(product, qty = 1) {
    buyNowItem = { product, qty };
    persist();
  },
  clearBuyNow() {
    buyNowItem = null;
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
    () => items,
  );
  const safe = hydrated ? (snapshot || []).filter((i) => i && i.product) : [];
  const total = safe.reduce(
    (s, i) => s + (Number(i.product.price) || 0) * (Number(i.qty) || 0),
    0,
  );
  const count = safe.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const safeBuyNow = hydrated && buyNowItem && buyNowItem.product ? buyNowItem : null;

  return {
    items: safe,
    total,
    count,
    buyNowItem: safeBuyNow,
    ...cartActions,
  };
}

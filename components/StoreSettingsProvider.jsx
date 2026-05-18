"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const StoreSettingsContext = createContext(null);

// Sensible fallback so pages never hang when the DB is unreachable
const FALLBACK_SETTINGS = {
  storeName: "Sabir Shah Traders",
  deliveryFee: 400,
  freeDeliveryThreshold: 0,
  shipping: { freeShippingGlobal: true, expressEnabled: false, expressRate: 0 },
  tax: { enabled: false, rate: 0, label: "GST", inclusive: false },
  uiLabels: { addToCart: "Add to Cart", buyNow: "Buy Now", checkout: "Checkout", shopNow: "Shop Now" },
  maintenanceMode: false,
};

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    // Abort after 4 s so the page never hangs when the DB is unreachable
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch("/api/settings", {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok || data?.error) {
        setError(data?.error || "Failed to load settings");
        setSettings((prev) => prev ?? FALLBACK_SETTINGS);
        return;
      }
      setSettings(data);
    } catch (e) {
      clearTimeout(timer);
      setError(e.message || "Failed to load settings");
      // Fall back to defaults — never leave settings null
      setSettings((prev) => prev ?? FALLBACK_SETTINGS);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Refresh every 30 seconds (faster than 60) for better real-time updates
    const id = setInterval(refresh, 30_000);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const loading = settings === null && error === null;

  const value = useMemo(
    () => ({ settings, loading, error, refresh }),
    [settings, loading, error, refresh],
  );

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const ctx = useContext(StoreSettingsContext);
  if (!ctx) {
    return { settings: FALLBACK_SETTINGS, loading: false, error: null, refresh: () => {} };
  }
  return ctx;
}

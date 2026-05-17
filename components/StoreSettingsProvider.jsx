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

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setError(data?.error || "Failed to load settings");
        setSettings(null);
        return;
      }
      setSettings(data);
    } catch (e) {
      setError(e.message || "Failed to load settings");
      setSettings(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(refresh, 60_000);
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
    return { settings: null, loading: true, error: null, refresh: () => {} };
  }
  return ctx;
}

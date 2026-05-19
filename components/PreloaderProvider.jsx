"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const PreloaderContext = createContext({
  isPreloaderActive: false,
  showPageContent: false,
  isPreloaderExiting: false,
});

export function PreloaderProvider({ children }) {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [showPageContent, setShowPageContent] = useState(false);
  const [isPreloaderExiting, setIsPreloaderExiting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = pathname?.startsWith("/admin");
    if (isAdmin) {
      setIsPreloaderActive(false);
      setShowPageContent(true);
      setIsPreloaderExiting(true);
      return;
    }

    // Trigger preloader on every page navigation
    setIsPreloaderActive(true);
    setShowPageContent(false);
    setIsPreloaderExiting(false);
    
    // 1. Trigger the preloader exit slide-up at 2.0s
    const exitTimer = setTimeout(() => {
      setIsPreloaderExiting(true);
    }, 2000);

    // 2. Page content starts revealing and animating at 2.5s (near the end of preloader exit slide)
    const revealTimer = setTimeout(() => {
      setShowPageContent(true);
    }, 2500);

    // 3. Preloader is completely unmounted at 2.8s (when exit slide-up finishes)
    const activeTimer = setTimeout(() => {
      setIsPreloaderActive(false);
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(revealTimer);
      clearTimeout(activeTimer);
    };
  }, [pathname]);

  return (
    <PreloaderContext.Provider value={{ isPreloaderActive, showPageContent, isPreloaderExiting }}>
      {children}
    </PreloaderContext.Provider>
  );
}

export const usePreloader = () => useContext(PreloaderContext);

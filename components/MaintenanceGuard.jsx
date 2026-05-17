"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Hammer, ShieldCheck } from "lucide-react";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

export function MaintenanceGuard({ children }) {
  const pathname = usePathname();
  const { settings, loading } = useStoreSettings();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setIsAdmin(true);
      return;
    }
    fetch("/api/admin/check-auth", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [pathname]);

  if (loading) return null;

  const maintenance = Boolean(settings?.maintenanceMode);

  if (maintenance && !isAdmin && !pathname.startsWith("/admin")) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20 rotate-12">
            <Hammer className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-4">Under Maintenance</h1>
        <p className="text-muted-foreground max-w-md leading-relaxed mb-8">
          {settings?.storeName
            ? `We're currently performing scheduled upgrades to ${settings.storeName}. We'll be back online shortly.`
            : "We're currently performing scheduled upgrades. We'll be back online shortly."}
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          System Maintenance in Progress
        </div>
      </div>
    );
  }

  return children;
}

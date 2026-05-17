"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

export function AnnouncementBar() {
  const { settings } = useStoreSettings();
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || settings?.showAnnouncement === false) return null;

  const formatPKR = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace("PKR", "Rs");
  };

  let text = settings?.announcementBar || "Official Sabir Shah Store";
  const shipping = settings?.shipping || {};

  if (shipping.freeShippingGlobal) {
    text = "Free Delivery Across Pakistan";
  } else if (shipping.freeDeliveryThreshold > 0) {
    text = `Free Delivery on orders over ${formatPKR(shipping.freeDeliveryThreshold)}`;
  } else if (settings?.announcementBar) {
    text = settings.announcementBar;
  }

  return (
    <motion.div
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      className="bg-foreground text-background py-2 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] relative z-50">
      <div className="flex items-center justify-center gap-4 animate-pulse-glow">
        <span>{text}</span>
        <span className="hidden sm:inline opacity-30">|</span>
        <span className="hidden sm:inline">Official Sabir Shah Store</span>
      </div>
    </motion.div>
  );
}

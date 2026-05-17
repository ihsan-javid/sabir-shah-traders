"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search, Heart, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchSidebar } from "@/components/SearchSidebar";
import { CartSidebar } from "@/components/CartSidebar";
import { WishlistSidebar } from "@/components/WishlistSidebar";
import { Tooltip } from "@/components/ui/tooltip";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

const nav = [
  { href: "/", label: "Home" },
  { href: "/supplements", label: "Nutrition" },
  { href: "/electronics", label: "Electronics" },
  { href: "/track-order", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { count } = useCart();
  const { items: wishlistItems } = useWishlist();
  const pathname = usePathname();
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (open) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => document.body.classList.remove("no-scroll");
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="relative z-50 glass">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.webp" alt={settings?.storeName || "Store logo"} className="h-10 w-auto object-contain" />
          <div className="leading-tight">
            <div className="font-display font-semibold tracking-widest">{settings?.storeName?.split(" ").slice(0, 2).join(" ") || "Sabir Shah"}</div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/80">{settings?.storeName?.split(" ").slice(2).join(" ") || "Traders"}</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => {
            const isActive = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group text-sm transition-colors relative inline-flex items-center gap-1.5 py-1 ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{n.label}</span>
                <span
                  className={`absolute left-0 bottom-0 h-[2px] w-full bg-foreground origin-left transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Tooltip content="Search" position="bottom">
            <button
              onClick={() => setSearchOpen(true)}
              className="relative h-10 w-10 rounded-full glass grid place-items-center group hover:shadow-glow-tech transition-shadow"
              aria-label="Search"
            >
              <div className="relative h-4 w-4 overflow-hidden">
                 <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                   <Search className="h-4 w-4 shrink-0" />
                   <Search className="h-4 w-4 shrink-0" />
                 </div>
              </div>
            </button>
          </Tooltip>
          
          <Tooltip content="Wishlist" position="bottom">
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative h-10 w-10 rounded-full glass grid place-items-center group hover:shadow-glow-health transition-shadow"
              aria-label="Wishlist"
            >
              <div className="relative h-4 w-4 overflow-hidden">
                 <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                   <Heart className="h-4 w-4 shrink-0" />
                   <Heart className="h-4 w-4 shrink-0 fill-red-500 text-red-500 border-none" />
                 </div>
              </div>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-background" />
              )}
            </button>
          </Tooltip>

          <Tooltip content="Cart" position="bottom">
            <button
              onClick={() => setCartOpen(true)}
              className="relative h-10 w-10 rounded-full glass grid place-items-center group hover:shadow-glow-health transition-shadow"
              aria-label="Cart"
            >
              <div className="relative h-4 w-4 overflow-hidden">
                 <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                   <ShoppingBag className="h-4 w-4 shrink-0" />
                   <ShoppingBag className="h-4 w-4 shrink-0" />
                 </div>
              </div>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-health-gradient text-health-foreground text-[10px] font-bold grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          </Tooltip>
          <button
            className="md:hidden h-10 w-10 rounded-full glass grid place-items-center cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Dark/blurred overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md md:hidden"
              onClick={() => setOpen(false)}
            />
            {/* Drawer sliding from RIGHT */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed right-0 top-0 h-[100dvh] w-[85%] max-w-[400px] bg-background z-[70] shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.5)] flex flex-col md:hidden border-l border-white/5 overflow-hidden"
            >
              {/* Background accent glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

              <div className="flex items-center justify-between p-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl grid place-items-center">
                    <img src="/logo.webp" alt="Logo" className="h-6 w-auto" />
                  </div>
                  <div className="font-display text-2xl font-black tracking-tighter uppercase">Menu</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-12 w-12 rounded-full glass grid place-items-center hover:bg-accent transition-colors cursor-pointer border border-border/50 group"
                >
                  <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-8 flex flex-col justify-center space-y-2 custom-scrollbar">
                {nav.map((item, i) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.2 + i * 0.08,
                        type: "spring",
                        damping: 20,
                        stiffness: 100
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group relative flex items-center justify-between py-5 text-3xl font-display font-bold transition-all border-b border-border/40 ${
                          isActive ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        <span className="relative z-10 transition-transform group-hover:translate-x-2 duration-500">
                          {item.label}
                        </span>
                        <ChevronRight className={`h-6 w-6 transition-all duration-500 ${
                          isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 group-hover:opacity-50 group-hover:translate-x-0"
                        }`} />
                        
                        {/* Hover underline effect */}
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={() => { setOpen(false); setSearchOpen(true); }}
                    className="flex-1 h-14 rounded-2xl bg-muted/50 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest hover:bg-muted transition-all border border-border/50"
                  >
                    <Search className="h-4 w-4" /> Search
                  </motion.button>
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => { setOpen(false); setWishlistOpen(true); }}
                    className="h-14 w-14 rounded-2xl glass flex items-center justify-center relative hover:bg-muted transition-all border border-border/50"
                  >
                    <Heart className={`h-5 w-5 ${wishlistItems.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
                    {wishlistItems.length > 0 && (
                      <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                  </motion.button>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex justify-center gap-6 text-muted-foreground"
                >
                  <div className="text-[10px] uppercase tracking-[0.4em]">Sabir Shah Traders ®</div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistSidebar isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </header>
  );
}

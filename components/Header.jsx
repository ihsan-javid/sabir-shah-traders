"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { SearchSidebar } from "@/components/SearchSidebar";
import { CartSidebar } from "@/components/CartSidebar";
import { WishlistSidebar } from "@/components/WishlistSidebar";

const nav = [
  { href: "/", label: "Home" },
  { href: "/supplements", label: "Nutrition" },
  { href: "/electronics", label: "Electronics" },
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
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="relative z-50 glass">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/images/logo.webp" alt="Sabir Shah Traders Logo" className="h-10 w-auto object-contain" />
          <div className="leading-tight">
            <div className="font-display font-semibold tracking-widest">Sabir Shah</div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/80">Traders</div>
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
          <button
            className="md:hidden h-10 w-10 rounded-full glass grid place-items-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-5 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-sm hover:bg-accent inline-flex items-center justify-between"
              >
                <span>{n.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistSidebar isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </header>
  );
}

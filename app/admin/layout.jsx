"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  MessageSquare, 
  Settings2, 
  Sparkles, 
  UserCircle,
  Menu,
  X,
  Search,
  Users,
  TrendingUp,
  DollarSign,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return children;
  }

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const navSections = [
    {
      label: "Main",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Sales & Traffic", icon: TrendingUp },
      ]
    },
    {
      label: "Catalog",
      items: [
        { href: "/admin/products", label: "All Products", icon: Package },
        { href: "/admin/products?new=true", label: "Add Product", icon: Plus },
        { href: "/admin/categories", label: "Categories", icon: Sparkles },
        { href: "/admin/inventory", label: "Inventory & Stock", icon: Package },
        { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      ]
    },
    {
      label: "Orders",
      items: [
        { href: "/admin/orders", label: "All Orders", icon: ShoppingCart },
        { href: "/admin/orders/pending", label: "Pending", icon: ShoppingCart },
        { href: "/admin/orders/refunds", label: "Refunds", icon: DollarSign },
      ]
    },
    {
      label: "Customers",
      items: [
        { href: "/admin/customers", label: "All Customers", icon: Users },
        { href: "/admin/customers/vip", label: "VIP & Groups", icon: Sparkles },
        { href: "/admin/support", label: "Support Tickets", icon: MessageSquare },
      ]
    },
    {
      label: "Marketing",
      items: [
        { href: "/admin/coupons", label: "Coupons", icon: DollarSign },
        { href: "/admin/campaigns", label: "Flash Sales", icon: TrendingUp },
        { href: "/admin/banners", label: "Banners & Popups", icon: LayoutDashboard },
      ]
    },
    {
      label: "Appearance",
      items: [
        { href: "/admin/customize", label: "Homepage Editor", icon: Settings2 },
        { href: "/admin/seo", label: "SEO Settings", icon: Search },
      ]
    },
    {
      label: "Intelligence",
      items: [
        { href: "/admin/ai", label: "AI Generator", icon: Sparkles },
        { href: "/admin/predictions", label: "Sales Prediction", icon: TrendingUp },
      ]
    },
    {
      label: "System",
      items: [
        { href: "/admin/staff", label: "Staff & Roles", icon: UserCircle },
        { href: "/admin/settings", label: "Store Settings", icon: Settings2 },
        { href: "/admin/logs", label: "Activity Logs", icon: LayoutDashboard },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 h-screen overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-gradient grid place-items-center shadow-glow-primary">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight">Admin Hub</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">Sabir Shah Traders</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1.5">
              <div className="px-4 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">
                {section.label}
              </div>
              {section.items.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 relative ${
                      active
                        ? "text-primary bg-primary/10"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <n.icon className={`h-4 w-4 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                    <span className="font-medium">{n.label}</span>
                    {active && (
                      <motion.div 
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="px-4 flex items-center gap-3 py-3">
             <div className="h-8 w-8 rounded-full bg-white/5 grid place-items-center">
               <UserCircle className="h-5 w-5 text-white/40" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">Master Admin</div>
                <div className="text-[10px] text-white/30 truncate uppercase tracking-wider">Superuser</div>
             </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav Trigger */}
      <div className="lg:hidden fixed top-4 right-4 z-[60]">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-12 w-12 rounded-2xl bg-primary text-black grid place-items-center shadow-2xl"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-health/5 blur-[120px]" />
           <div className="absolute inset-0 noise opacity-[0.02]" />
        </div>

        <div className="relative z-10 flex-1 p-6 lg:p-12">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black flex flex-col p-8 lg:hidden"
          >
             <div className="mb-12">
                <div className="font-display text-2xl font-bold tracking-tight">Admin Hub</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/30">Mobile Panel</div>
             </div>
             <nav className="space-y-4">
                {nav.map(n => (
                  <Link 
                    key={n.href} 
                    href={n.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 text-xl font-display uppercase tracking-wider ${pathname === n.href ? "text-primary" : "text-white/40"}`}
                  >
                    <n.icon className="h-6 w-6" /> {n.label}
                  </Link>
                ))}
             </nav>
             <button onClick={logout} className="mt-auto flex items-center gap-4 text-red-400 text-xl font-display uppercase tracking-wider">
               <LogOut className="h-6 w-6" /> Logout
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

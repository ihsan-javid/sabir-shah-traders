"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Settings2,
  UserCircle,
  Menu,
  X,
  Search,
  Users,
  Plus,
  Tag,
  Star,
  Image,
  Globe,
  Palette,
  Shield,
  Bell,
  ChevronDown,
  ChevronRight,
  Store,
  FileText,
  Layers,
  BarChart2,
  Ticket,
  Megaphone,
  FolderOpen,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";


function NavItem({ item, pathname, collapsed, onClick }) {
  const isActive =
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        isActive ?
          "bg-[#1E7A46]/10 text-[#1E7A46]"
        : "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111111]"
      } ${collapsed ? "justify-center px-2" : ""}`}>
      <item.icon
        className={`flex-shrink-0 h-4 w-4 ${
          isActive ? "text-[#1E7A46]" : (
            "text-[#9CA3AF] group-hover:text-[#111111]"
          )
        }`}
      />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto h-5 min-w-[20px] flex items-center justify-center rounded-full bg-[#F59E0B] text-white text-[10px] font-bold px-1.5">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-[#F59E0B] border-2 border-white" />
      )}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#1E7A46] rounded-r-full" />
      )}
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const sidebarCollapsed = false; // Strictly maximize desktop sidebar (no toggle, maximized 64w)
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Interactive Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], orders: [], categories: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ products: [], orders: [], categories: [] });
      return;
    }
    const delay = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        // ignore
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const fetchCounts = async () => {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrderCount(data.orderCount || 0);
        setReviewCount(data.reviewCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      // Failed to load silent notifications
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchCounts();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const navGroups = [
    {
      label: "Overview",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
      ],
    },
    {
      label: "Store",
      items: [
        {
          href: "/admin/orders",
          label: "Orders",
          icon: ShoppingCart,
          badge: orderCount > 0 ? String(orderCount) : null,
        },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/inventory", label: "Inventory", icon: SlidersHorizontal },
      ],
    },
    {
      label: "Marketing",
      items: [
        { href: "/admin/coupons", label: "Coupons", icon: Ticket },
        { href: "/admin/reviews", label: "Reviews", icon: Star, badge: reviewCount > 0 ? String(reviewCount) : null },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/customize", label: "Content Manager", icon: FileText },
        { href: "/admin/media", label: "Media Library", icon: FolderOpen },
      ],
    },
    {
      label: "Configuration",
      items: [
        { href: "/admin/seo", label: "SEO Settings", icon: Globe },
        { href: "/admin/policies", label: "Policy Settings", icon: FileText },
        { href: "/admin/theme", label: "Theme Settings", icon: Palette },
        { href: "/admin/settings", label: "Settings", icon: Settings2 },
      ],
    },
  ];

  const markAsRead = async (id) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
        credentials: "include",
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      // Failed silently
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
        credentials: "include",
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      // Failed silently
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
        credentials: "include",
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      // Failed silently
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin-login");
    router.refresh();
  };

  const breadcrumbs = (() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Admin", href: "/admin" }];
    let path = "";
    for (let i = 1; i < segments.length; i++) {
      path += "/" + segments[i];
      crumbs.push({
        label: segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
        href: "/admin" + path,
      });
    }
    return crumbs;
  })();

  return (
    <div className="admin-layout min-h-screen bg-[#F8F9FA] flex">
      {/* ─── Desktop Sidebar ─── */}
      <aside
        data-lenis-prevent
        className="hidden lg:flex flex-col border-r border-[#E5E7EB] bg-white sticky top-0 h-screen w-64 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-3 px-4 py-5 border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-all">
          <div className="h-8 w-8 rounded-lg bg-[#1E7A46] flex items-center justify-center flex-shrink-0">
            <Store className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-[#111111] text-sm leading-tight">
              Sabir Shah
            </div>
            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">
              Admin Panel
            </div>
          </div>
        </Link>

        <nav
          data-lenis-prevent
          className="flex-1 py-4 px-2 overflow-y-auto space-y-5 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={false}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E5E7EB] p-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-5 border-b border-[#E5E7EB]">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className="h-8 w-8 rounded-lg bg-[#1E7A46] flex items-center justify-center">
                  <Store className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[#111111] text-sm leading-tight">
                    Sabir Shah
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                    Admin Panel
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-[#F3F4F6]">
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-5">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        collapsed={false}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-[#E5E7EB] p-3">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] flex items-center gap-4 px-4 lg:px-6 py-3">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
            onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <nav className="hidden md:flex items-center gap-1 text-sm flex-1 min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-[#D1D5DB] flex-shrink-0" />
                )}
                <Link
                  href={crumb.href}
                  className={`truncate ${
                    i === breadcrumbs.length - 1 ?
                      "font-semibold text-[#111111]"
                    : "text-[#9CA3AF] hover:text-[#111111]"
                  }`}>
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex-1 md:flex-none" />

          <div className="relative hidden sm:flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search products, orders, categories..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-64 lg:w-80 pl-9 pr-4 py-2 text-sm bg-[#F3F4F6] border border-transparent rounded-lg focus:outline-none focus:border-[#1E7A46]/50 focus:bg-white transition-all animate-fade-in"
            />
            {searchOpen && (searchQuery.trim().length >= 2) && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] py-3 z-50 overflow-hidden animate-fade-in">
                {searchLoading ? (
                  <div className="px-4 py-6 text-center text-xs text-[#9CA3AF]">
                    Searching database...
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto divide-y divide-[#F3F4F6] custom-scrollbar">
                    {/* Products */}
                    {searchResults.products?.length > 0 && (
                      <div className="p-2">
                        <h4 className="px-3 py-1 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                          Products
                        </h4>
                        {searchResults.products.map((p) => (
                          <Link
                            key={p._id}
                            href={`/admin/products`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                            {p.image && (
                              <img src={p.image} className="h-8 w-8 rounded object-cover bg-slate-100" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#111111] truncate">{p.name}</p>
                              <p className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">{p.category}</p>
                            </div>
                            <span className="text-xs font-black text-[#1E7A46] font-mono">
                              PKR {p.price.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Orders */}
                    {searchResults.orders?.length > 0 && (
                      <div className="p-2">
                        <h4 className="px-3 py-1 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                          Orders
                        </h4>
                        {searchResults.orders.map((o) => (
                          <Link
                            key={o._id}
                            href={`/admin/orders`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3F4F6] transition-colors">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#111111]">{o.orderNumber}</p>
                              <p className="text-[10px] text-[#9CA3AF]">{o.customer?.name}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#4B5563] px-2 py-0.5 rounded border border-slate-200">
                              {o.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {searchResults.categories?.length > 0 && (
                      <div className="p-2">
                        <h4 className="px-3 py-1 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                          Categories
                        </h4>
                        {searchResults.categories.map((c) => (
                          <Link
                            key={c._id}
                            href={`/admin/categories`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="block px-3 py-2 rounded-lg hover:bg-[#F3F4F6] text-xs font-semibold text-[#111111] transition-colors">
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    )}

                    {!(searchResults.products?.length > 0 || searchResults.orders?.length > 0 || searchResults.categories?.length > 0) && (
                      <div className="px-4 py-8 text-center text-xs text-[#9CA3AF]">
                        No matching results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/admin/products?new=true"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E7A46] text-white text-sm font-medium hover:bg-[#166a3a] transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]">
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#E5E7EB] flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-[#111111]">Notifications</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-[#1E7A46] hover:underline font-medium">
                      Mark all read
                    </button>
                    <span className="text-gray-300 text-xs">|</span>
                    <button
                      onClick={clearAll}
                      className="text-[10px] text-red-500 hover:underline font-medium">
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#F3F4F6]">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-[#9CA3AF]">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.href) {
                            router.push(n.href);
                          }
                          setNotificationsOpen(false);
                        }}
                        className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors ${n.read ? "hover:bg-[#F8F9FA]" : "bg-emerald-50/40 hover:bg-[#F8F9FA]"}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          n.type === "order" ? "bg-blue-100 text-blue-600" :
                          n.type === "stock" ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        }`}>
                          {n.type === "order" ? <ShoppingCart className="h-4 w-4" /> :
                           n.type === "stock" ? <Package className="h-4 w-4" /> :
                           <Star className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.read ? "text-[#374151]" : "text-[#111111] font-semibold"}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                            {new Date(n.time).toLocaleString("en-PK", { dateStyle: "short", timeStyle: "short" })}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-[#1E7A46] mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors">
              <div className="h-7 w-7 rounded-full bg-[#1E7A46]/10 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-[#1E7A46]" />
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1 z-50">
                <div className="px-4 py-3 border-b border-[#E5E7EB]">
                  <div className="text-sm font-semibold text-[#111111]">
                    Master Admin
                  </div>
                  <div className="text-xs text-[#9CA3AF]">
                    admin@sabirshah.com
                  </div>
                </div>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F3F4F6]"
                  onClick={() => setProfileOpen(false)}>
                  <Settings2 className="h-4 w-4" /> Settings
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0">{children}</main>
      </div>

      {(profileOpen || notificationsOpen || searchOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setProfileOpen(false);
            setNotificationsOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </div>
  );
}

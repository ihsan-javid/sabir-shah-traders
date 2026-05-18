"use client";
// =============================================================================
// Admin Shared UI Primitives
// Use these everywhere in the admin panel. Zero one-off styles for components.
// =============================================================================

import { useEffect, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

// ── Spinner ──────────────────────────────────────────────────────────────────
export function AdminSpinner({ className = "" }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function AdminEmpty({
  icon: Icon = AlertCircle,
  title = "No data found",
  description = "",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
        {title}
      </p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 opacity-60">
          {description}
        </p>
      )}
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────
export function AdminError({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <p className="text-sm font-bold text-red-500 mb-4">{message}</p>
      {onRetry && (
        <AdminButton variant="outline" onClick={onRetry} size="sm">
          Try Again
        </AdminButton>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";

// ── Button ────────────────────────────────────────────────────────────────────
export function AdminButton({
  children,
  variant = "primary", // primary | secondary | danger | ghost | outline
  size = "md", // sm | md | lg
  icon: Icon,
  loading = false,
  className = "",
  ...props
}) {
  const isDanger = variant === "danger";
  const bgClass = isDanger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-foreground text-background";
  const hoverBgClass = isDanger ? "bg-red-800" : "bg-[#1E7A46]";

  return (
    <button
      {...props}
      className={`group/text relative overflow-hidden rounded-full font-black transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 ${bgClass} ${
        size === "sm" ? "px-4 py-2 text-[10px]" :
        size === "lg" ? "px-7 py-3 text-xs" : "px-5 py-2.5 text-[10px]"
      } ${className}`}
    >
      {/* Background Fill Overlay */}
      <div className={`absolute inset-0 ${hoverBgClass} translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:translate-y-0`} />

      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin relative z-10 mr-0.5 shrink-0" />}
      {Icon && !loading && <Icon className="h-3.5 w-3.5 relative z-10 mr-0.5 shrink-0" />}

      {/* Text Container — fixed height so text is never clipped */}
      <span className="relative flex flex-col h-4 overflow-hidden leading-none pointer-events-none z-10 uppercase tracking-widest font-black">
        <span className="flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:-translate-y-full shrink-0 h-4">
          {children}
        </span>
        <span className="flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover/text:-translate-y-full text-white shrink-0 h-4 font-black">
          {children}
        </span>
      </span>
    </button>
  );
}

// ── Icon Button ───────────────────────────────────────────────────────────────
export function AdminIconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  let mappedVariant = "ghost";
  if (variant === "primary") mappedVariant = "default";
  else if (variant === "danger") mappedVariant = "destructive";
  else if (variant === "success") mappedVariant = "outline";

  return (
    <Button
      variant={mappedVariant}
      size="icon"
      title={label}
      className={`rounded-xl transition-all active:scale-95 disabled:opacity-50 ${
        size === "sm" ? "h-7 w-7" : size === "lg" ? "h-10 w-10" : "h-9 w-9"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : (
        <Icon className="h-4 w-4 shrink-0" />
      )}
    </Button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function AdminBadge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-muted text-muted-foreground border-border",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    amber: "bg-amber-50 text-amber-700 border-amber-200/50",
    red: "bg-red-50 text-red-600 border-red-200/50",
    blue: "bg-blue-50 text-blue-700 border-blue-200/50",
    purple: "bg-purple-50 text-purple-700 border-purple-200/50",
    orange: "bg-orange-50 text-orange-700 border-orange-200/50",
    primary: "bg-primary/10 text-primary border-primary/20",
    pending: "bg-amber-50 text-amber-700 border-amber-200/50",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    rejected: "bg-red-50 text-red-600 border-red-200/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function AdminInput({ className = "", icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      )}
      <input
        className={`w-full ${Icon ? "pl-9" : "px-4"} pr-4 py-2.5 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium ${className}`}
        {...props}
      />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function AdminTextarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-4 py-3 border border-border rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none ${className}`}
      {...props}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function AdminSelect({ className = "", children, ...props }) {
  return (
    <select
      className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider border border-border rounded-xl bg-card text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
      {...props}>
      {children}
    </select>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
export function AdminLabel({ children, required, className = "" }) {
  return (
    <label
      className={`block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ${className}`}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function AdminStatCard({
  label,
  value,
  growth,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10",
  subtext,
}) {
  const positive = growth == null || growth >= 0;
  return (
    <div className="group bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`h-9 w-9 rounded-xl ${bgClass} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
        {growth != null && (
          <span
            className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${positive ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-500 border border-red-100"}`}>
            {positive ?
              <ArrowUpRight className="h-2.5 w-2.5" />
            : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      <div className="text-xl font-black text-foreground tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
        {label}
      </div>
      {subtext && (
        <div className="text-[9px] font-bold text-primary mt-1.5 uppercase tracking-widest opacity-80">
          {subtext}
        </div>
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function AdminCard({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border shadow-sm ${noPadding ? "" : "p-5"} ${className}`}>
      {children}
    </div>
  );
}

// ── Card Header ───────────────────────────────────────────────────────────────
export function AdminCardHeader({ title, action, description }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
      <div>
        <h2 className="text-xs font-black text-foreground uppercase tracking-widest">
          {title}
        </h2>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground uppercase tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ── Table Wrapper ─────────────────────────────────────────────────────────────
export function AdminTable({ children, className = "" }) {
  return (
    <div
      className={`overflow-x-auto custom-scrollbar overscroll-contain ${className}`}
      data-lenis-prevent>
      <table className="w-full text-left text-sm border-separate border-spacing-0">
        {children}
      </table>
    </div>
  );
}

export function AdminTHead({ children }) {
  return (
    <thead>
      <tr className="bg-muted/50">{children}</tr>
    </thead>
  );
}

export function AdminTH({ children, className = "" }) {
  return (
    <th
      className={`px-5 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border ${className}`}>
      {children}
    </th>
  );
}

export function AdminTD({ children, className = "" }) {
  return (
    <td className={`px-5 py-3 border-b border-border/50 ${className}`}>
      {children}
    </td>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative flex-1 max-w-sm group ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
      />
    </div>
  );
}

// ── Toggle Tabs (filter tabs) ─────────────────────────────────────────────────
export function AdminToggleTabs({ tabs, active, onChange }) {
  // tabs: [{ id, label }]
  return (
    <div className="flex items-center bg-muted/30 border border-border rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
            active === tab.id ?
              "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
          }`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function AdminModal({ isOpen, onClose, title, description, children, className = "" }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const el = modalRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const scrollable = el.querySelector(".overflow-y-auto");
      if (!scrollable) return;

      const { deltaY } = e;
      const { scrollTop, scrollHeight, clientHeight } = scrollable;

      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((isAtTop && deltaY < 0) || (isAtBottom && deltaY > 0)) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    const handleTouchMove = (e) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />
      <div
        className={`relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 transition-all transform scale-100 ${className}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest leading-tight">{title}</h3>
            {description && (
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest font-medium">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 border border-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/products";
import Link from "next/link";
import { useEffect } from "react";
import { TextButton } from "@/components/ui/text-button";

export function CartSidebar({ isOpen, onClose }) {
  const { items, total, setQty, remove } = useCart();
  const shipping = total > 5000 ? 0 : items.length ? 250 : 0;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 h-[100dvh] w-full max-w-md bg-surface z-[70] shadow-2xl border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="font-display font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Your Cart
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-full glass grid place-items-center hover:bg-accent transition-colors group overflow-hidden">
                <div className="relative h-4 w-4 overflow-hidden">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                    <X className="h-4 w-4 shrink-0" />
                    <X className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                  <p>Your cart is empty.</p>
                  <TextButton text="Continue shopping" onClick={onClose} className="mt-4 w-fit mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((it) => (
                      <motion.div
                        key={it.product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 items-center bg-card p-3 rounded-2xl border border-border"
                      >
                        <img
                          src={it.product.image}
                          alt={it.product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm line-clamp-1">{it.product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatPKR(it.product.price)}</div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex items-center glass rounded-full h-7">
                              <button onClick={() => setQty(it.product.id, it.qty - 1)} className="h-full w-7 grid place-items-center text-muted-foreground group overflow-hidden">
                                <div className="relative h-3 w-3 overflow-hidden">
                                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3">
                                    <Minus className="h-3 w-3 shrink-0" />
                                    <Minus className="h-3 w-3 shrink-0" />
                                  </div>
                                </div>
                              </button>
                              <div className="w-6 text-center text-xs font-semibold">{it.qty}</div>
                              <button onClick={() => setQty(it.product.id, it.qty + 1)} className="h-full w-7 grid place-items-center text-muted-foreground group overflow-hidden">
                                <div className="relative h-3 w-3 overflow-hidden">
                                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3">
                                    <Plus className="h-3 w-3 shrink-0" />
                                    <Plus className="h-3 w-3 shrink-0" />
                                  </div>
                                </div>
                              </button>
                            </div>
                            <button onClick={() => remove(it.product.id)} className="text-xs text-muted-foreground hover:text-destructive group overflow-hidden">
                              <div className="relative h-4 w-4 overflow-hidden">
                                <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                                  <Trash2 className="h-4 w-4 shrink-0" />
                                  <Trash2 className="h-4 w-4 shrink-0" />
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-border bg-card">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{formatPKR(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span><span>{formatPKR(total + shipping)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full block"
                >
                  <TextButton text="Checkout" className="w-full" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

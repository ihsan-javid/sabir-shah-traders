"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/products";
import { useEffect } from "react";
import { TextButton } from "@/components/ui/text-button";
import { toast } from "sonner";
import { Tooltip } from "@/components/ui/tooltip";

export function WishlistSidebar({ isOpen, onClose }) {
  const { items, toggle, clear } = useWishlist();
  const { add } = useCart();

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
                <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Your Wishlist
              </div>
              <Tooltip content="Close Wishlist" position="left">
                <button onClick={onClose} className="h-8 w-8 rounded-full glass grid place-items-center hover:bg-accent transition-colors group overflow-hidden cursor-pointer">
                  <div className="relative h-4 w-4 overflow-hidden">
                    <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                      <X className="h-4 w-4 shrink-0" />
                      <X className="h-4 w-4 shrink-0" />
                    </div>
                  </div>
                </button>
              </Tooltip>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar overscroll-contain" data-lenis-prevent>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mb-4 opacity-20" />
                  <p>Your wishlist is empty.</p>
                  <TextButton text="Continue shopping" onClick={onClose} className="mt-4 w-fit mx-auto" />
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((product) => (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 items-center bg-card p-3 rounded-2xl border border-border"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm line-clamp-1">{product.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatPKR(product.price)}</div>
                          <div className="mt-3 flex items-center gap-2">
                            <button 
                              onClick={() => {
                                add(product, 1);
                                toast.success("Added to cart");
                              }}
                              className="flex-1 h-8 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                            >
                              <ShoppingBag className="h-3 w-3" /> Add to Cart
                            </button>
                            <Tooltip content="Remove Item" position="top">
                              <button 
                                onClick={() => toggle(product)} 
                                className="h-8 w-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-destructive group overflow-hidden"
                              >
                                  <div className="relative h-4 w-4 overflow-hidden">
                                    <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                                      <Trash2 className="h-4 w-4 shrink-0" />
                                      <Trash2 className="h-4 w-4 shrink-0" />
                                    </div>
                                  </div>
                              </button>
                            </Tooltip>
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
                <TextButton 
                  text="Clear Wishlist" 
                  onClick={() => {
                    clear();
                  }} 
                  className="w-full bg-white text-black border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors" 
                />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

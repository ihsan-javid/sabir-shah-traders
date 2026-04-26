"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/products";
import { TextButton } from "@/components/ui/text-button";

export default function CartPage() {
  const { items, total, setQty, remove } = useCart();
  const shipping = total > 5000 ? 0 : items.length ? 250 : 0;

  return (
    <section className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Your cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length === 0 ? "Your cart is empty." : `${items.length} item${items.length > 1 ? "s" : ""}`}
        </p>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl glass p-16 text-center">
            <div className="mx-auto h-16 w-16 rounded-full glass grid place-items-center">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mt-5 text-muted-foreground">Looks empty in here. Let&apos;s find you something good.</p>
            <Link
              href="/"
              className="mt-6 inline-block w-fit mx-auto"
            >
              <TextButton text="Start shopping" />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              <AnimatePresence>
                {items.map((it) => (
                  <motion.div
                    key={it.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl glass p-4 flex gap-4 items-center"
                  >
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      width={120}
                      height={120}
                      loading="lazy"
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${it.product.slug}`}
                        className="font-semibold hover:underline line-clamp-1"
                      >
                        {it.product.name}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {it.product.brand} · {it.product.category}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center glass rounded-full">
                          <button
                            onClick={() => setQty(it.product.id, it.qty - 1)}
                            className="h-8 w-8 grid place-items-center text-muted-foreground"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-8 text-center text-sm font-semibold">{it.qty}</div>
                          <button
                            onClick={() => setQty(it.product.id, it.qty + 1)}
                            className="h-8 w-8 grid place-items-center text-muted-foreground"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.product.id)}
                          className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                    <motion.div
                      key={it.qty}
                      initial={{ scale: 0.9, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display font-bold whitespace-nowrap"
                    >
                      {formatPKR(it.product.price * it.qty)}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="rounded-2xl glass p-6 h-fit lg:sticky lg:top-24">
              <div className="font-semibold mb-4">Order summary</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <motion.span key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    {formatPKR(total)}
                  </motion.span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="font-display">{formatPKR(total + shipping)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 w-full block"
              >
                <TextButton text="Checkout" className="w-full" />
              </Link>
              <p className="mt-3 text-[11px] text-center text-muted-foreground">Cash on delivery available</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

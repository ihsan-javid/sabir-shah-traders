"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/products";
import { toast } from "sonner";
import { TextButton } from "@/components/ui/text-button";

function Field({ label, className = "", ...rest }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/30 transition"
      />
    </label>
  );
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [done, setDone] = useState(false);
  const router = useRouter();
  const shipping = total > 5000 ? 0 : items.length ? 250 : 0;

  const submit = (e) => {
    e.preventDefault();
    setDone(true);
    clear();
    toast.success("Order placed! We'll call you shortly.");
    setTimeout(() => router.push("/"), 3000);
  };

  if (done) {
    return (
      <section className="pt-28 pb-24 min-h-[80vh] grid place-items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.7 }}
          className="text-center max-w-md px-5"
        >
          <div className="mx-auto h-20 w-20 rounded-full bg-health-gradient grid place-items-center shadow-glow-health">
            <Check className="h-10 w-10 text-health-foreground" />
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold">Order placed!</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you. Our team will contact you within 24 hours to confirm delivery.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cash on delivery — pay when it arrives.</p>

        <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl glass p-6">
              <div className="font-semibold mb-4">Contact</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full Name" name="name" required />
                <Field label="Phone" name="phone" type="tel" required />
                <Field label="Email (optional)" name="email" type="email" className="sm:col-span-2" />
              </div>
            </div>
            <div className="rounded-2xl glass p-6">
              <div className="font-semibold mb-4">Delivery</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Address" name="address" required className="sm:col-span-2" />
                <Field label="City" name="city" required />
                <Field label="Postal Code" name="postal" />
              </div>
            </div>
            <div className="rounded-2xl glass p-6">
              <div className="font-semibold mb-2">Payment</div>
              <div className="flex items-center gap-3 rounded-xl bg-surface-elevated p-4 border border-border">
                <div className="h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-background font-bold text-xs">
                  COD
                </div>
                <div>
                  <div className="text-sm font-semibold">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay in cash when your order arrives.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass p-6 h-fit lg:sticky lg:top-24">
            <div className="font-semibold mb-4">Your order</div>
            <div className="space-y-3 max-h-72 overflow-auto pr-2">
              {items.map((it) => (
                <div key={it.product.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={it.product.image}
                    alt={it.product.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1">{it.product.name}</div>
                    <div className="text-xs text-muted-foreground">× {it.qty}</div>
                  </div>
                  <div className="text-sm font-semibold">{formatPKR(it.product.price * it.qty)}</div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-sm text-muted-foreground">Your cart is empty.</div>
              )}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatPKR(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span><span className="font-display">{formatPKR(total + shipping)}</span>
              </div>
            </div>
            <TextButton
              type="submit"
              disabled={items.length === 0}
              className="mt-6 w-full"
              text="Place order"
            />
          </div>
        </form>
      </div>
    </section>
  );
}

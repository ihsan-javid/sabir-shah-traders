"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Truck, ArrowLeft, Star, Plus, Minus, PackageX, Cpu } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPKR } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { trackView } from "@/lib/recently-viewed";
import { useReviews } from "@/lib/reviews";
import { ReviewList, ReviewForm } from "@/components/Reviews";
import { toast } from "sonner";
import { TextButton } from "@/components/ui/text-button";

export default function ProductPageClient({ product }) {
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const cart = useCart();
  const accent = product.category === "electronics" ? "tech" : "health";
  const isElectronics = product.category === "electronics";
  const outOfStock = product.stock === 0;

  useEffect(() => {
    trackView(product.slug);
    
    // Fetch related products
    fetch(`/api/products?category=${product.category}&limit=4`)
      .then(r => r.json())
      .then(data => {
        const filtered = (data.products || []).filter(p => p._id !== product._id).slice(0, 3);
        setRelated(filtered);
      });
  }, [product.slug, product.category, product._id]);

  const reviews = useReviews(product.slug);

  return (
    <>
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-hero-gradient grid-bg relative">
        <div className="absolute inset-0 noise" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Link
            href={isElectronics ? "/electronics" : "/supplements"}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to {product.category}
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square rounded-3xl overflow-hidden glass"
            >
              <img
                src={product.image}
                alt={product.name}
                width={800}
                height={800}
                className={`absolute inset-0 h-full w-full object-cover ${outOfStock ? "grayscale opacity-70" : ""}`}
              />
              <div className={`absolute inset-0 ${accent === "tech" ? "shadow-glow-tech" : "shadow-glow-health"} opacity-50`} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.25em]">
                {product.brand} · {product.category}
              </div>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">{product.name}</h1>
              <p className="mt-2 text-muted-foreground">{product.tagline}</p>

              <div className="mt-4 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold">
                    {reviews.count > 0 ? reviews.avg.toFixed(1) : product.rating}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ({reviews.count > 0 ? `${reviews.count} customer review${reviews.count > 1 ? "s" : ""}` : `${product.reviews} reviews`})
                </span>
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold">{formatPKR(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-base text-muted-foreground line-through">{formatPKR(product.oldPrice)}</span>
                )}
              </div>

              <div className="mt-3">
                {outOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <PackageX className="h-3.5 w-3.5" /> Out of stock
                  </span>
                ) : product.stock <= 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-health">
                    <span className="h-2 w-2 rounded-full bg-health" /> In stock
                  </span>
                )}
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <span className={`h-5 w-5 rounded-full grid place-items-center ${accent === "tech" ? "bg-tech/20" : "bg-health/20"}`}>
                      <Check className={`h-3 w-3 ${accent === "tech" ? "text-tech" : "text-health"}`} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              {isElectronics ? (
                <div className="mt-8 rounded-2xl glass p-5 flex items-start gap-4">
                  <Cpu className="h-5 w-5 text-tech shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Electronics showroom — coming soon</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This product is part of our upcoming electronics line. Order via WhatsApp for inquiries.
                    </p>
                    <a
                      href={`https://wa.me/923000000000?text=Inquiry%20about%20${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-tech-gradient px-5 py-2.5 text-xs font-semibold text-tech-foreground"
                    >
                      Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center glass rounded-full">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-11 w-11 grid place-items-center hover:text-foreground text-muted-foreground"
                      aria-label="Decrease"
                      disabled={outOfStock}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-10 text-center font-semibold">{qty}</div>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="h-11 w-11 grid place-items-center hover:text-foreground text-muted-foreground"
                      aria-label="Increase"
                      disabled={outOfStock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <TextButton
                      disabled={outOfStock}
                      onClick={() => {
                        cart.add(product, qty);
                        toast.success(`Added ${qty} × ${product.name}`);
                      }}
                      className="w-full"
                      text={outOfStock ? "Sold out" : "Add to cart"}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-tech" /> 100% Authentic
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-health" /> Cash on Delivery
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Reviews</div>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {reviews.count > 0 ? `${reviews.count} customer review${reviews.count > 1 ? "s" : ""}` : "Be the first to review"}
              </h2>
            </div>
            {reviews.count > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-display text-2xl font-bold">{reviews.avg.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
            )}
          </div>
          <ReviewList reviews={reviews.reviews} emptyMessage="No reviews yet — share your experience below." />
          <div className="mt-10">
            <ReviewForm productSlug={product.slug} />
          </div>
        </div>
      </section>


      {related.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 className="font-display text-3xl font-bold mb-10">You may also like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

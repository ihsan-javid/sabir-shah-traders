"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ShieldCheck,
  Truck,
  ArrowLeft,
  ArrowRight,
  Star,
  Plus,
  Minus,
  PackageX,
  Cpu,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { formatPKR } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import {
  productImageUrlHero,
  productImageUrlThumb,
} from "@/lib/cloudinaryUrls";
import { useCart } from "@/lib/cart";
import { trackView } from "@/lib/recently-viewed";
import { useReviews } from "@/lib/reviews";
import { ReviewList, ReviewForm } from "@/components/Reviews";
import { toast } from "sonner";
import { TextButton } from "@/components/ui/text-button";
import { useStoreSettings } from "@/components/StoreSettingsProvider";
import { orderTotalsFromSettings } from "@/lib/payments";

export default function ProductPageClient({ product }) {
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(product.image);
  const { settings } = useStoreSettings();
  const cart = useCart();
  const accent = product.category === "electronics" ? "tech" : "health";
  const isElectronics = product.category === "electronics";
  const outOfStock = product.stock === 0;

  const allImages = useMemo(() => {
    const list = Array.isArray(product.images) ? [...product.images] : [];
    if (product.image && !list.includes(product.image)) {
      list.unshift(product.image);
    }
    return list;
  }, [product.image, product.images]);

  const hasGallery = allImages.length > 1;

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  const hasSizes = product.sizes && product.sizes.length > 0 && !isElectronics;
  const [selectedSize, setSelectedSize] = useState(
    hasSizes ? product.sizes[0] : null,
  );

  // TASK 1 (simultaneous price and compare price variant update) in PDP
  const displayPrice = selectedSize ? selectedSize.price : product.price;

  const shippingPreview = useMemo(() => {
    if (!settings) return null;
    return orderTotalsFromSettings(
      [{ product: { price: displayPrice }, qty }],
      settings,
      null,
      "COD",
    ).shippingLabel;
  }, [settings, displayPrice, qty]);

  useEffect(() => {
    trackView(product.slug);

    fetch(`/api/products?category=${product.category}&limit=4`)
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.products || [])
          .filter((p) => p._id !== product._id)
          .slice(0, 3);
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
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to {product.category}
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden glass shadow-2xl group/slider">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={productImageUrlHero(activeImage)}
                    alt={product.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute inset-0 h-full w-full object-cover ${outOfStock ? "grayscale opacity-70" : ""}`}
                  />
                </AnimatePresence>

                {hasGallery && (
                  <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        const idx = allImages.indexOf(activeImage);
                        const prev =
                          idx > 0 ?
                            allImages[idx - 1]
                          : allImages[allImages.length - 1];
                        setActiveImage(prev);
                      }}
                      className="h-10 w-10 rounded-full glass border border-white/20 grid place-items-center pointer-events-auto hover:bg-white/20 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const idx = allImages.indexOf(activeImage);
                        const next =
                          idx < allImages.length - 1 ?
                            allImages[idx + 1]
                          : allImages[0];
                        setActiveImage(next);
                      }}
                      className="h-10 w-10 rounded-full glass border border-white/20 grid place-items-center pointer-events-auto hover:bg-white/20 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div
                  className={`absolute inset-0 ${accent === "tech" ? "shadow-glow-tech" : "shadow-glow-health"} opacity-50 pointer-events-none`}
                />
              </div>

              {hasGallery && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}>
                      <img
                        src={productImageUrlThumb(img)}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.25em]">
                {product.brand} · {product.category}
              </div>
              <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
                {product.name}
              </h1>
              <p className="mt-2 text-muted-foreground">{product.tagline}</p>

              <div className="mt-4 flex items-center gap-3 text-sm">
                {reviews.count > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" />
                      <span className="font-semibold">
                        {reviews.avg.toFixed(1)} ★
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      ({reviews.count} review{reviews.count > 1 ? "s" : ""})
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground italic font-medium">
                    No reviews yet
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-[#1E7A46]">
                  {formatPKR(displayPrice)}
                </span>
              </div>

              <div className="mt-3">
                {outOfStock ?
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <PackageX className="h-3.5 w-3.5" /> Out of stock
                  </span>
                : product.stock <= 10 ?
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                    Only {product.stock} left in stock
                  </span>
                : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-health">
                    <span className="h-2 w-2 rounded-full bg-health" /> In stock
                  </span>
                }
              </div>

              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-3">
                {(product.benefits || []).map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <span
                      className={`h-5 w-5 rounded-full grid place-items-center ${accent === "tech" ? "bg-tech/20" : "bg-health/20"}`}>
                      <Check
                        className={`h-3 w-3 ${accent === "tech" ? "text-tech" : "text-health"}`}
                      />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {hasSizes && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold mb-3">
                      Select Size
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(product.sizes || []).map((size) => (
                        <button
                          key={size.label}
                          onClick={() => setSelectedSize(size)}
                          className={`relative h-10 px-6 rounded-full text-xs font-bold tracking-wider transition-colors border ${
                            selectedSize?.label === size.label ?
                              "text-background border-transparent"
                            : "text-muted-foreground border-border hover:border-foreground"
                          }`}>
                          {selectedSize?.label === size.label && (
                            <motion.div
                              layoutId={`page-size-bg-${product._id}`}
                              className="absolute inset-0 bg-foreground rounded-full -z-10"
                              transition={{
                                type: "spring",
                                bounce: 0.2,
                                duration: 0.6,
                              }}
                            />
                          )}
                          <span className="relative z-10">{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center glass rounded-full">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-11 w-11 grid place-items-center hover:text-foreground text-muted-foreground"
                      aria-label="Decrease"
                      disabled={outOfStock}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-10 text-center font-semibold">{qty}</div>
                    <button
                      onClick={() =>
                        setQty((q) => Math.min(product.stock, q + 1))
                      }
                      className="h-11 w-11 grid place-items-center hover:text-foreground text-muted-foreground"
                      aria-label="Increase"
                      disabled={outOfStock}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <TextButton
                      disabled={outOfStock}
                      onClick={() => {
                        const productToAdd =
                          selectedSize ?
                            {
                              ...product,
                              name: `${product.name} (${selectedSize.label})`,
                              price: displayPrice,
                              _id: `${product._id}-${selectedSize.label}`,
                            }
                          : { ...product, price: displayPrice };
                        cart.add(productToAdd, qty);
                        toast.success(`Added ${qty} × ${productToAdd.name}`);
                      }}
                      className="w-full sm:w-1/2 py-3.5"
                      text={
                        outOfStock ? "Sold out" : (
                          settings?.uiLabels?.addToCart || "Add to cart"
                        )
                      }
                    />
                    <TextButton
                      disabled={outOfStock}
                      onClick={() => {
                        const productToAdd =
                          selectedSize ?
                            {
                              ...product,
                              name: `${product.name} (${selectedSize.label})`,
                              price: displayPrice,
                              _id: `${product._id}-${selectedSize.label}`,
                            }
                          : { ...product, price: displayPrice };
                        cart.buyNow(productToAdd, qty);
                        window.location.href = "/checkout";
                      }}
                      className="w-full sm:w-1/2 py-3.5"
                      text={settings?.uiLabels?.buyNow || "Buy Now"}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-tech shrink-0" /> 100%
                  Authentic
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-4 w-4 text-health shrink-0" />
                  <span>
                    {shippingPreview || "Shipping calculated at checkout"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {settings?.shipping?.codEnabled === false ?
                    "COD unavailable — contact us to order"
                  : `Cash on Delivery${settings?.shipping?.codFee > 0 ? ` (+${formatPKR(settings.shipping.codFee)} fee)` : ""}`
                  }
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
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Reviews
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {reviews.count > 0 ?
                  `${reviews.count} customer review${reviews.count > 1 ? "s" : ""}`
                : "Be the first to review"}
              </h2>
            </div>
            {reviews.count > 0 && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="font-display text-2xl font-bold">
                  {reviews.avg.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/ 5</span>
              </div>
            )}
          </div>
          <ReviewList
            reviews={reviews.reviews}
            emptyMessage="No reviews yet — share your experience below."
          />
          <div className="mt-10">
            <ReviewForm productSlug={product.slug} onSuccess={reviews.refresh} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <h2 className="font-display text-3xl font-bold mb-10">
              You may also like
            </h2>
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

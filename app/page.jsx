"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Truck,
  MessageCircle,
  Sparkles,
  FlaskConical,
  Award,
  HeartPulse,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { TextButton } from "@/components/ui/text-button";
import { ReviewMarquee } from "@/components/ui/review-marquee";
import { FlowButton } from "@/components/ui/flow-button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { useStoreSettings } from "@/components/StoreSettingsProvider";
import { usePreloader } from "@/components/PreloaderProvider";

import {
  IdentityCardBody,
  RevealCardContainer,
} from "@/components/ui/animated-profile-card";
import { ProductSkeleton } from "@/components/ProductSkeleton";

export default function HomePage() {
  const { settings } = useStoreSettings();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  const supplementsVisible = useMemo(
    () => categories.find((c) => c.slug === "supplements")?.visible !== false,
    [categories],
  );
  const electronicsVisible = useMemo(
    () => categories.find((c) => c.slug === "electronics")?.visible !== false,
    [categories],
  );

  return (
    <>
      <Hero />
      <Bestsellers />
      <Marquee />
      <WhyChooseUs />

      {/* Nutrition Section */}
      <section className="py-20 bg-muted/20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-health font-bold">
                Daily Essentials
              </div>
              <h2 className="mt-3 font-display text-4xl font-bold">
                {settings?.supplementsTitle || "Nutrition & Wellness"}
              </h2>
            </div>
            <Link
              href="/supplements"
              className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-health transition-colors">
              View Collection{" "}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <SupplementsShowcase visible={supplementsVisible} />
        </div>
      </section>

      {/* Electronics Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-tech font-bold">
                Next-Gen Tech
              </div>
              <h2 className="mt-3 font-display text-4xl font-bold">
                {settings?.electronicsTitle || "Electronics & Gear"}
              </h2>
            </div>
            <Link
              href="/electronics"
              className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-tech transition-colors">
              View Collection{" "}
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ElectronicsShowcase visible={electronicsVisible} />
        </div>
      </section>

      <ReviewMarquee />
      <CTABand />
    </>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const { settings } = useStoreSettings();
  const { showPageContent } = usePreloader();
  const heroTitle =
    settings?.heroTitle || "Fuel your strength. Trust your source.";
  const heroDescription =
    settings?.heroDescription ||
    "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves.";
  const [visibleCategories, setVisibleCategories] = useState([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => {
        const visibleSlugs =
          Array.isArray(cats) ?
            cats.filter((c) => c.visible !== false).map((c) => c.slug)
          : [];
        setVisibleCategories(visibleSlugs);
      });
  }, []);

  useGSAP(
    () => {
      if (!showPageContent) return;
      gsap.from(".hero-line", {
        yPercent: 100,
        stagger: 0.12,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.2,
      });
      gsap.from(".hero-fade", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.9,
        ease: "expo.out",
        delay: 0.4,
      });
      gsap.from(".hero-img", {
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        ease: "expo.out",
        delay: 0.05,
      });
    },
    { scope: heroRef, dependencies: [heroTitle, showPageContent] },
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-svh overflow-hidden pt-24 bg-hero-gradient">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 flex flex-col justify-center min-h-[calc(100svh-96px)]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <div className="hero-fade inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="tracking-wide uppercase">
                Premium Nutrition · Pakistan
              </span>
            </div>
            <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] tracking-tight text-foreground">
              {heroTitle
                .split(".")
                .filter((t) => t.trim().length > 0)
                .map((part, i) => (
                  <span key={i} className="block overflow-hidden">
                    <span
                      className={`hero-line block ${i === 0 ? "" : "font-serif-italic text-gradient-gold"}`}>
                      {part.trim()}.
                    </span>
                  </span>
                ))}
            </h1>
            <p className="hero-fade mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              {heroDescription}
            </p>
            <div className="hero-fade mt-10 flex flex-wrap items-center gap-3">
              {visibleCategories.includes("supplements") && (
                <ButtonWithIcon
                  as={Link}
                  href="/supplements"
                  icon={ArrowRight}
                  className="bg-primary text-primary-foreground hover:bg-primary shadow-glow-health">
                  {settings?.heroButtonText || "Shop Nutrition"}
                </ButtonWithIcon>
              )}
            </div>
          </div>
          <div className="hero-img relative">
            <div className="relative aspect-[4/3] lg:aspect-[5/5] w-full rounded-3xl overflow-hidden shadow-elevated animate-float">
              <img
                src={
                  settings?.heroImage ||
                  "https://res.cloudinary.com/dxhvfs4he/image/upload/v1779030421/sabir-shah/assets/new-hero-image.webp"
                }
                alt="Premium nutrition"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bestsellers() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([cats, prodData]) => {
        const allProducts = prodData.products || [];
        const visibleSlugs =
          Array.isArray(cats) ?
            cats.filter((c) => c.visible !== false).map((c) => c.slug)
          : [];
        const visibleProducts = allProducts.filter(
          (p) => visibleSlugs.includes(p.category) && p.bestseller,
        );
        setFeatured(visibleProducts.slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (featured.length === 0) return null;

  return (
    <section className="py-12 bg-white/50 relative">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-border/60" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-bold">
            Bestsellers
          </p>
          <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 4).map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link href="/bestsellers">
            <TextButton text="Show More" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Free Delivery",
    "Cash on Delivery",
    "100% Authentic",
    "Fast Shipping",
    "WhatsApp Order",
    "Pan-Pakistan",
  ];
  const loop = [...items, ...items];
  return (
    <div className="relative border-y border-border bg-surface/40 overflow-hidden py-4">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {loop.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-health-gradient" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyChooseUs() {
  const items = [
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      desc: "Sourced directly from verified suppliers.",
      accent: "#e0f2fe",
    },
    {
      icon: FlaskConical,
      title: "Lab-tested quality",
      desc: "Only products from reputable brands.",
      accent: "#f0fdf4",
    },
    {
      icon: Truck,
      title: "Fast delivery",
      desc: "Reliable shipping across Pakistan.",
      accent: "#fff7ed",
    },
    {
      icon: HeartPulse,
      title: "Goal-driven",
      desc: "Formulas matched to real results.",
      accent: "#fdf2f8",
    },
    {
      icon: MessageCircle,
      title: "Expert support",
      desc: "Talk to a real human for help.",
      accent: "#f5f3ff",
    },
    {
      icon: Award,
      title: "Athlete trusted",
      desc: "Recommended by pros.",
      accent: "#fefce8",
    },
  ];

  return (
    <section className="py-24 lg:py-32 border-y border-border bg-surface/30 relative overflow-hidden">
      <div className="absolute inset-0 noise" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-health">
            Why Sabir Shah
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
            Nutrition done right.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pakistan deserves supplements you can actually trust.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}>
              <RevealCardContainer
                accent={it.accent}
                textOnAccent="#0f172a"
                mutedOnAccent="#475569"
                className="w-full h-[260px]"
                base={
                  <IdentityCardBody
                    fullName={it.title}
                    about={it.desc}
                    icon={it.icon}
                    scheme="plain"
                    displayAvatar={false}
                  />
                }
                overlay={
                  <IdentityCardBody
                    fullName={it.title}
                    about={it.desc}
                    icon={it.icon}
                    scheme="accented"
                    displayAvatar={false}
                    cardCss={{ backgroundColor: "var(--accent-color)" }}
                  />
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupplementsShowcase({ visible }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      return;
    }
    fetch(`/api/products?category=supplements&limit=4`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, [visible]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );

  if (!visible)
    return (
      <div className="col-span-full">
        <div className="relative overflow-hidden rounded-3xl border border-health/20 bg-gradient-to-br from-health/5 via-background to-health/10 p-12 lg:p-20 text-center group">
          {/* Animated blobs */}
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-health/10 blur-3xl animate-pulse pointer-events-none" />
          <div
            className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-health/15 blur-3xl animate-pulse pointer-events-none"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-health/5 blur-[80px] pointer-events-none" />
          {/* Grid texture */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-health/30 bg-health/10 text-health text-xs font-bold uppercase tracking-[0.3em] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-health animate-pulse" />
              Restocking Soon
            </div>
            <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] mb-6">
              <span className="text-gradient-health">Coming</span>
              <br />
              <span className="text-foreground">Soon.</span>
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              We&apos;re curating the finest nutrition products. Our shelves
              will be stocked with premium supplements very soon.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, 4).map((p, i) => (
        <ProductCard key={p._id} product={p} index={i} />
      ))}
    </div>
  );
}

function ElectronicsShowcase({ visible }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) {
      setLoading(false);
      return;
    }
    fetch(`/api/products?category=electronics&limit=4`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, [visible]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );

  if (!visible)
    return (
      <div className="col-span-full">
        <div className="relative overflow-hidden rounded-3xl border border-tech/20 bg-gradient-to-br from-tech/5 via-background to-tech/10 p-12 lg:p-20 text-center group">
          {/* Animated blobs */}
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-tech/10 blur-3xl animate-pulse pointer-events-none" />
          <div
            className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-tech/15 blur-3xl animate-pulse pointer-events-none"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-tech/5 blur-[80px] pointer-events-none" />
          {/* Grid texture */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-tech/30 bg-tech/10 text-tech text-xs font-bold uppercase tracking-[0.3em] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-tech animate-pulse" />
              Launching Soon
            </div>
            <h3 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] mb-6">
              <span className="text-gradient-tech">Coming</span>
              <br />
              <span className="text-foreground">Soon.</span>
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              We&apos;re curating a premium line of electronics and gadgets. Our
              tech showroom opens very soon.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, 4).map((p, i) => (
        <ProductCard key={p._id} product={p} index={i} />
      ))}
    </div>
  );
}

function CTABand() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient grid-bg" />
      <div className="absolute inset-0 noise" />
      <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          Ready to fuel your{" "}
          <span className="text-gradient-health">best self</span>?
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <FlowButton
            as={Link}
            href="/supplements"
            text="Start your journey"
            className="bg-primary text-black border-primary hover:text-white"
          />
        </div>
      </div>
    </section>
  );
}

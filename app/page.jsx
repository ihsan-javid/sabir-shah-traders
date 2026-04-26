"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { byCategory } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { ReviewMarquee } from "@/components/ui/review-marquee";
import { FlowButton } from "@/components/ui/flow-button";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import {
  IdentityCardBody,
  RevealCardContainer,
} from "@/components/ui/animated-profile-card";
import { ProductSkeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <WhyChooseUs />
      <ElectronicsShowcase />
      <ReviewMarquee />
      <CTABand />
    </>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const [settings, setSettings] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      });

    fetch("/api/products?category=supplements&limit=4")
      .then((r) => r.json())
      .then((data) => {
        setFeatured((data.products || []).slice(0, 4));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const heroTitle =
    settings?.heroTitle || "Fuel your strength. Trust your source.";
  const heroDescription =
    settings?.heroDescription ||
    "Authentic supplements, premium ingredients, and the trusted service Pakistan deserves. From protein to wellness — all in one place.";

  useGSAP(
    () => {
      gsap.from(".hero-line", {
        yPercent: 100,
        stagger: 0.15,
        duration: 1.2,
        ease: "expo.out",
        delay: 0.3,
      });
      gsap.from(".hero-fade", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
        delay: 0.6,
      });
      gsap.from(".hero-img", {
        opacity: 0,
        scale: 1.08,
        duration: 1.6,
        ease: "expo.out",
        delay: 0.1,
      });
      gsap.from(".hero-products", {
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: "expo.out",
        delay: 1.0,
      });
    },
    { scope: heroRef, dependencies: [heroTitle] },
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] overflow-hidden pt-16 bg-hero-gradient">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 flex flex-col gap-10 py-20 lg:py-24 min-h-[100svh] justify-center">
        {/* Top two-column row */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: copy */}
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
                      className={`hero-line block ${
                        i === 0 ? "" : "font-serif-italic text-gradient-gold"
                      }`}>
                      {part.trim()}.
                    </span>
                  </span>
                ))}
            </h1>

            <p className="hero-fade mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              {heroDescription}
            </p>

            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
              <ButtonWithIcon
                as={Link}
                href="/supplements"
                icon={ArrowRight}
                className="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-glow-health">
                Shop Nutrition
              </ButtonWithIcon>
              <ButtonWithIcon
                as={Link}
                href="/electronics"
                icon={Cpu}
                className="bg-card text-foreground border border-border hover:bg-card hover:text-foreground hover:border-tech/40 shadow-sm"
                iconClassName="text-tech group-hover:rotate-0">
                Explore Electronics
              </ButtonWithIcon>
            </div>

            <div className="hero-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 20 20">
                      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9z" />
                    </svg>
                  ))}
                </div>
                <span className="font-semibold text-foreground">4.9</span>
                <span className="text-muted-foreground">
                  from 1,200+ orders
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground/80">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">Authentic guarantee</span>
              </div>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="hero-img relative">
            <div className="relative aspect-[4/3] lg:aspect-[5/5] w-full rounded-3xl overflow-hidden shadow-elevated animate-float">
              <img
                src="/hero-nutrition.jpg"
                alt="Premium whey protein supplement with fresh greens and almonds"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="hero-fade absolute -bottom-6 -left-4 sm:left-6 bg-card rounded-2xl shadow-elevated px-5 py-4 flex items-center gap-3 border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  24g Protein
                </div>
                <div className="text-xs text-muted-foreground">Per scoop</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: 4 bestseller products + View all button */}
        <div className="hero-products">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium mb-5">
            Bestsellers
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {loading ?
              Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : featured.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))
            }
          </div>

          {!loading && (
            <div className="mt-8 flex justify-center">
              <FlowButton
                as={Link}
                href="/supplements"
                text="View all products"
                className="bg-primary text-black border-primary hover:text-white"
              />
            </div>
          )}
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
      desc: "Sourced directly from verified suppliers — every bottle is genuine, every time.",
      accent: "#e0f2fe",
    },
    {
      icon: FlaskConical,
      title: "Lab-tested quality",
      desc: "Only products from reputable, lab-tested brands make it onto our shelves.",
      accent: "#f0fdf4",
    },
    {
      icon: Truck,
      title: "Fast delivery",
      desc: "Reliable shipping across Pakistan with cash on delivery available everywhere.",
      accent: "#fff7ed",
    },
    {
      icon: HeartPulse,
      title: "Goal-driven",
      desc: "From muscle building to daily wellness — formulas matched to real results.",
      accent: "#fdf2f8",
    },
    {
      icon: MessageCircle,
      title: "Expert support",
      desc: "Talk to a real human for product advice, dosage, and order help.",
      accent: "#f5f3ff",
    },
    {
      icon: Award,
      title: "Athlete trusted",
      desc: "Recommended by gym goers, athletes, and health-conscious families.",
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
            Pakistan deserves supplements you can actually trust. Here&apos;s
            what makes us different.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}>
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

function ElectronicsShowcase() {
  const electronicsCount = byCategory("electronics").length;
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <Link
            href="/electronics"
            className="group relative block overflow-hidden rounded-3xl glass aspect-[16/10] sm:aspect-[16/7] lg:aspect-[16/6]">
            <div className="absolute inset-0 bg-gradient-to-br from-tech/30 via-background to-background" />
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-tech/30 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-tech/20 blur-3xl" />

            <div className="relative h-full flex flex-col justify-center px-7 sm:px-12 lg:px-16 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span className="h-7 w-7 rounded-full bg-tech text-tech-foreground grid place-items-center">
                  <Cpu className="h-3.5 w-3.5" />
                </span>
                Electronics
                {electronicsCount === 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-tech/15 text-tech font-bold tracking-wider">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                {electronicsCount > 0 ?
                  <>
                    Premium tech,{" "}
                    <span className="text-gradient-tech">curated.</span>
                  </>
                : <>
                    Premium tech is{" "}
                    <span className="text-gradient-tech">on the way.</span>
                  </>
                }
              </h3>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-md">
                {electronicsCount > 0 ?
                  "Browse hand-picked headphones, smartwatches, and speakers."
                : "Headphones, smartwatches, speakers and more — launching soon."
                }
              </p>
              <FlowButton
                text={
                  electronicsCount > 0 ? "Explore showroom" : "Visit showroom"
                }
                className="mt-6 w-fit"
                as="div"
              />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CTABand() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient grid-bg" />
      <div className="absolute inset-0 noise" />
      <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          Ready to fuel your{" "}
          <span className="text-gradient-health">best self</span>?
        </motion.h2>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          Browse the full nutrition catalog or place an order instantly via
          WhatsApp.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-10 flex flex-wrap justify-center gap-4">
          <FlowButton
            as={Link}
            href="/supplements"
            text="Start your journey"
            className="bg-primary text-black border-primary hover:text-white"
          />
        </motion.div>
      </div>
    </section>
  );
}

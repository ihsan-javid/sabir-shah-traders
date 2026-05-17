"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { useReviews } from "@/lib/reviews";
import { StarRow } from "@/components/Reviews";
import Link from "next/link";

export function ReviewsCarousel() {
  const { all } = useReviews();
  const scrollerRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="relative py-24 lg:py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Loved by customers
            </div>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">
              Real people. <span className="text-gradient-health">Real reviews.</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Every review below was submitted by a real customer. Be the next one.
            </p>
          </div>
          {all.length > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Previous"
                className="h-11 w-11 rounded-full glass grid place-items-center hover:shadow-glow-health transition group overflow-hidden"
              >
                <div className="relative h-4 w-4 overflow-hidden">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Next"
                className="h-11 w-11 rounded-full glass grid place-items-center hover:shadow-glow-health transition group overflow-hidden"
              >
                <div className="relative h-4 w-4 overflow-hidden">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-4">
                    <ChevronRight className="h-4 w-4 shrink-0" />
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {all.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 rounded-3xl glass p-12 text-center max-w-2xl mx-auto"
          >
            <Quote className="h-10 w-10 text-health mx-auto mb-4" />
            <p className="font-display text-xl">No reviews yet — be the first.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Order any product and share your experience to help others shop with confidence.
            </p>
            <Link
              href="/supplements"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-health-gradient px-5 py-3 text-sm font-semibold text-health-foreground shadow-glow-health"
            >
              <MessageCircle className="h-4 w-4" /> Shop &amp; review
            </Link>
          </motion.div>
        ) : (
          <div
            ref={scrollerRef}
            className="mt-12 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-5 px-5 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
            data-lenis-prevent
          >
            {all.map((r, i) => (
              <motion.div
                key={r.id || r._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="snap-start shrink-0 w-[85%] sm:w-[420px] rounded-3xl glass p-7 relative"
              >
                <Quote className="absolute top-5 right-5 h-7 w-7 text-health/30" />
                <StarRow value={r.rating} size={16} />
                <p className="mt-4 text-sm leading-relaxed">{r.comment}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-health-gradient grid place-items-center text-health-foreground font-bold text-sm">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    {r.city && (
                      <div className="text-[11px] text-muted-foreground">{r.city}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

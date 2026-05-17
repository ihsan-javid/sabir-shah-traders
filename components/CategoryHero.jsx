"use client";

import { motion } from "framer-motion";

export function CategoryHero({ accent, eyebrow, title, description, icon }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24 bg-hero-gradient grid-bg">
      <div className="absolute inset-0 noise" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <span
              className={`h-6 w-6 rounded-full grid place-items-center ${
                accent === "tech" ? "bg-tech text-tech-foreground" :
                accent === "gold" ? "bg-gold text-white" :
                "bg-health text-health-foreground"
              }`}
            >
              {icon}
            </span>
            <span className="text-muted-foreground uppercase tracking-[0.25em]">{eyebrow}</span>
          </div>
          <h1
            className={`mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] ${
              accent === "tech" ? "text-gradient-tech" :
              accent === "gold" ? "text-gradient-gold" :
              "text-gradient-health"
            }`}
          >
            {title}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

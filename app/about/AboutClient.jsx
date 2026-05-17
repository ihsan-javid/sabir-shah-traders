"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, MessageCircle, Sparkles, ArrowRight, Award, Zap } from "lucide-react";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { IdentityCardBody, RevealCardContainer } from "@/components/ui/animated-profile-card";

export default function AboutClient() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-hero-gradient grid-bg relative">
        <div className="absolute inset-0 noise" />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Our story</div>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
              Built on <span className="text-gradient-tech">trust</span>.<br />
              Powered by <span className="text-gradient-health">passion</span>.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Sabir Shah Traders began with a simple promise: to bring Pakistan a place where
              you can buy premium electronics and authentic supplements without ever
              second-guessing what you&apos;re getting.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 grid gap-10 md:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Our mission</div>
            <h2 className="mt-3 font-display text-4xl font-bold">
              Premium products. Honest prices. Real people.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              We hand-pick every product we sell. From the latest audio gear and smartwatches
              to clinically-tested supplements, our shelves only carry what we&apos;d buy ourselves.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              No fakes. No surprises. Just real products delivered with care across Pakistan.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: ShieldCheck, label: "Authentic", val: "100%", accent: "#f0fdf4" },
              { icon: Truck, label: "Cities served", val: "100+", accent: "#e0f2fe" },
              { icon: Sparkles, label: "Happy customers", val: "10k+", accent: "#fefce8" },
              { icon: MessageCircle, label: "Avg reply", val: "<5 min", accent: "#f5f3ff" },
            ].map((s) => (
              <RevealCardContainer
                key={s.label}
                accent={s.accent}
                textOnAccent="#0f172a"
                mutedOnAccent="#475569"
                className="w-full h-[180px]"
                base={
                  <div className="p-5 h-full flex flex-col justify-center">
                    <s.icon className="h-5 w-5 text-tech" />
                    <div className="mt-2 font-display text-3xl font-bold">{s.val}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                }
                overlay={
                  <div className="p-5 h-full flex flex-col justify-center" style={{ backgroundColor: "var(--accent-color)" }}>
                    <s.icon className="h-5 w-5 text-black/60" />
                    <div className="mt-2 font-display text-3xl font-bold text-black">{s.val}</div>
                    <div className="text-xs text-black/60 uppercase font-bold tracking-wider">{s.label}</div>
                  </div>
                }
              />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-border">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold">Our values</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3 text-left">
            {[
              { t: "Authenticity first", d: "Every item is sourced from verified suppliers — guaranteed genuine.", icon: ShieldCheck, accent: "#f0fdf4" },
              { t: "Customer-obsessed", d: "Real humans on WhatsApp. Real fast replies. Real care for your order.", icon: MessageCircle, accent: "#f5f3ff" },
              { t: "Quality over quantity", d: "We'd rather sell fewer products and stand behind every single one.", icon: Award, accent: "#fefce8" },
            ].map((v, i) => (
              <motion.div
                key={v.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <RevealCardContainer
                  accent={v.accent}
                  textOnAccent="#0f172a"
                  mutedOnAccent="#475569"
                  className="w-full h-[240px]"
                  base={
                    <IdentityCardBody 
                      fullName={v.t}
                      about={v.d}
                      icon={v.icon}
                      scheme="plain" 
                      displayAvatar={false} 
                    />
                  }
                  overlay={
                    <IdentityCardBody
                      fullName={v.t}
                      about={v.d}
                      icon={v.icon}
                      scheme="accented"
                      displayAvatar={false}
                      cardCss={{ backgroundColor: "var(--accent-color)" }}
                    />
                  }
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-16 flex justify-center">
            <ButtonWithIcon
              as={Link}
              href="/supplements"
              icon={ArrowRight}
              className="bg-primary text-primary-foreground shadow-glow-health px-10 py-5"
            >
              Start shopping
            </ButtonWithIcon>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TextButton } from "@/components/ui/text-button";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

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

export default function ContactClient() {
  const { settings } = useStoreSettings();
  const [sending, setSending] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      e.target.reset();
    }, 800);
  };

  const contactPhone = settings?.contactPhone || "+92 300 0000000";
  const contactEmail = settings?.contactEmail || "info@sabirshah.pk";
  const contactAddress = settings?.contactAddress || "Karachi, Pakistan";
  const waNum = (settings?.whatsappNumber || "923000000000").replace(/\D/g, "");

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 bg-hero-gradient grid-bg relative">
        <div className="absolute inset-0 noise" />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Talk to us</div>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
            We <span className="text-gradient-tech">reply</span> fast.
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 grid gap-10 lg:grid-cols-[1fr_400px]">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={submit}
            className="rounded-3xl glass p-7 sm:p-10 space-y-4"
          >
            <h2 className="font-display text-2xl font-bold">Send a message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <Field label="Subject" name="subject" />
            <label className="block">
              <span className="text-xs text-muted-foreground">Message</span>
              <textarea
                required
                rows={5}
                className="mt-1.5 w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-tech focus:ring-2 focus:ring-tech/30 transition resize-none"
              />
            </label>
            <TextButton
              type="submit"
              disabled={sending}
              className="mt-6 w-full"
              text={sending ? "Sending..." : "Send Message"}
            />
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <a
              href={`https://wa.me/${waNum}`}
              target="_blank"
              rel="noreferrer noopener"
              className="block rounded-2xl glass p-5 hover:shadow-glow-health transition-shadow"
            >
              <MessageCircle className="h-5 w-5 text-health" />
              <div className="mt-3 font-semibold">WhatsApp</div>
              <div className="text-sm text-muted-foreground mt-1">{contactPhone}</div>
              <div className="text-[11px] text-muted-foreground mt-2">Avg reply: under 5 minutes</div>
            </a>
            <div className="rounded-2xl glass p-5">
              <Mail className="h-5 w-5 text-tech" />
              <div className="mt-3 font-semibold">Email</div>
              <div className="text-sm text-muted-foreground mt-1">{contactEmail}</div>
            </div>
            <div className="rounded-2xl glass p-5">
              <MapPin className="h-5 w-5 text-gold" />
              <div className="mt-3 font-semibold">Office</div>
              <div className="text-sm text-muted-foreground mt-1">{contactAddress}</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

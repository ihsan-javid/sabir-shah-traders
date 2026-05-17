"use client";

import { motion } from "framer-motion";
import { Star, Send } from "lucide-react";
import { useState } from "react";
import { reviewActions } from "@/lib/reviews";
import { toast } from "sonner";
import { TextButton } from "@/components/ui/text-button";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function StarRow({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= Math.round(value) ?
              "fill-gold text-gold"
            : "text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, emptyMessage = "No reviews yet." }) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {reviews.map((r, i) => (
        <motion.div
          key={r.id || r._id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
          className="rounded-2xl glass p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-sm">{r.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {r.city ? `${r.city} · ` : ""}
                {formatDate(r.createdAt)}
              </div>
            </div>
            <StarRow value={r.rating} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {r.comment}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export function ReviewForm({ productSlug, onSuccess }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error("Please add your name and a comment.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          name: name.trim(),
          city: city.trim() || undefined,
          rating,
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Thank you! Your review has been published successfully.");
        setName("");
        setCity("");
        setComment("");
        setRating(5);
        if (onSuccess) onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review.");
      }
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl glass p-6">
      <div className="font-semibold mb-4">Write a review</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          className="rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-health focus:ring-2 focus:ring-health/30 transition"
          required
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City (optional)"
          className="rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-health focus:ring-2 focus:ring-health/30 transition"
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Rating:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110 group overflow-hidden"
              aria-label={`${i} stars`}>
              <div className="relative h-6 w-6 overflow-hidden">
                <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-6">
                  <Star
                    className={`h-6 w-6 shrink-0 ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
                  />
                  <Star
                    className={`h-6 w-6 shrink-0 ${i <= rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience…"
        rows={4}
        required
        className="mt-3 w-full rounded-xl bg-surface-elevated border border-border px-4 py-3 text-sm focus:outline-none focus:border-health focus:ring-2 focus:ring-health/30 transition resize-none"
      />
      <div className="mt-4 w-fit">
        <TextButton
          type="submit"
          disabled={submitting}
          text={submitting ? "Posting..." : "Post review"}
        />
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="space-y-10">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
           <h1 className="font-display text-4xl font-bold tracking-tight uppercase">Customer Reviews</h1>
           <p className="text-white/40 mt-2">Moderate and manage testimonials from your customers.</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-6">
        {reviews.map((r) => (
          <div key={r._id} className="group relative rounded-3xl border border-white/5 bg-white/[0.03] p-6 lg:p-8 hover:bg-white/[0.05] transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-display text-xl font-bold uppercase">
                     {r.name.charAt(0)}
                   </div>
                   <div>
                      <div className="font-bold text-lg">{r.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{r.city || "Verified Buyer"}</div>
                   </div>
                </div>
                
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-primary text-primary" : "text-white/10"}`} />
                  ))}
                </div>

                <p className="text-white/70 leading-relaxed max-w-2xl">
                  &ldquo;{r.comment}&rdquo;
                </p>

                <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                   Ref: {r.productSlug || "Site-wide Testimonial"} • {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => deleteReview(r._id)}
                   className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                   title="Delete Review"
                 >
                   <Trash2 className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] p-20 text-center">
             <MessageSquare className="h-12 w-12 text-white/10 mx-auto mb-4" />
             <div className="text-white/40 font-display text-xl uppercase tracking-widest">No reviews to manage</div>
             <p className="text-white/20 text-sm mt-2 font-medium">When customers leave feedback, it will appear here.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

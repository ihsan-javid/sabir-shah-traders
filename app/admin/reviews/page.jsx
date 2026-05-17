"use client";

import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ConfirmationModal from "@/components/admin/ConfirmationModal";
import {
  AdminSpinner,
  AdminEmpty,
  AdminButton,
  AdminIconButton,
  AdminBadge,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminPageHeader,
  AdminCard,
  AdminStatCard,
} from "@/components/admin/AdminShared";

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // No productSlug filter → admin gets ALL reviews
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    const matchSearch =
      (r.productSlug || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.productName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase());
    const matchRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
    return matchSearch && matchRating;
  });

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/reviews/${confirmDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted permanently");
      setConfirmDelete(null);
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) { toast.error("Reply cannot be empty"); return; }
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply posted");
      fetchReviews();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Reviews"
        description="Manage customer reviews for all products across the storefront."
        actions={
          <AdminIconButton
            icon={RefreshCw}
            label="Refresh"
            variant="ghost"
            onClick={fetchReviews}
            loading={loading}
          />
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStatCard label="Total Reviews" value={reviews.length} icon={Star} />
        <AdminStatCard
          label="Avg Rating"
          value={avgRating}
          icon={Star}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
        />
      </div>

      {/* Rating Distribution */}
      <AdminCard>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Rating Distribution</h3>
        <div className="space-y-2.5">
          {ratingDist.map(({ r, count }) => (
            <div key={r} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12 flex-shrink-0">
                <span className="text-xs font-bold text-foreground">{r}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground w-8 text-right opacity-60">{count}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Filters Bar */}
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex flex-wrap items-center gap-3">
        <AdminInput
          icon={({ className }) => (
            <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product, name or comment..."
          className="flex-1 min-w-[200px]"
        />
        <AdminSelect value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </AdminSelect>
      </div>

      {/* Review List */}
      <div className="space-y-3">
        {loading && reviews.length === 0 ? (
          <AdminCard><AdminSpinner /></AdminCard>
        ) : filtered.length === 0 ? (
          <AdminCard>
            <AdminEmpty icon={Star} title="No reviews found" description="Try adjusting your filters." />
          </AdminCard>
        ) : (
          filtered.map((review) => (
            <div
              key={review._id}
              className="bg-card rounded-2xl border border-border shadow-sm transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar + Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary flex-shrink-0 uppercase">
                      {(review.name || "C")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm">{review.name}</span>
                        {review.city && (
                          <span className="text-[10px] text-muted-foreground opacity-50 uppercase">{review.city}</span>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <StarRating rating={review.rating} />
                        {/* Product name link */}
                        <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-wider">
                          on{" "}
                          {review.productSlug ? (
                            <Link
                              href={`/product/${review.productSlug}`}
                              target="_blank"
                              className="text-primary opacity-100 hover:underline inline-flex items-center gap-0.5"
                            >
                              {review.productName || review.productSlug}
                              <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                            </Link>
                          ) : (
                            <span className="text-foreground opacity-100">Site-wide</span>
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed font-medium">
                        {review.comment}
                      </p>

                      {review.reply && (
                        <div className="mt-3 pl-3 border-l-2 border-primary/30 bg-primary/5 p-3 rounded-r-xl">
                          <div className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest">Admin Reply</div>
                          <p className="text-sm text-muted-foreground font-medium italic">&ldquo;{review.reply}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <AdminButton
                      variant="danger"
                      icon={Trash2}
                      onClick={() => setConfirmDelete(review._id)}
                    >
                      Delete
                    </AdminButton>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This cannot be undone."
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useReviews(productSlug) {
  const [reviews, setReviews] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      let url = "/api/reviews";
      if (productSlug) {
        url += `?productSlug=${productSlug}`;
      }
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = data.reviews || [];
        setReviews(list);
        setAll(list);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const add = async (input) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        toast.success("Thank you! Your review has been published successfully.");
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Failed to submit review");
    }
  };

  return {
    reviews,
    all,
    avg,
    count: reviews.length,
    loading,
    add,
    refresh: fetchReviews,
  };
}

export const reviewActions = {
  add: async (input) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        toast.success("Thank you! Your review has been published successfully.");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review");
      }
    } catch (err) {
      toast.error("Failed to submit review");
    }
  }
};

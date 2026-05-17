"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, FileText, RefreshCw, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const POLICY_METADATA = {
  shipping: {
    title: "Shipping Policy",
    icon: Truck,
    description: "Everything you need to know about delivery times, costs, and tracking.",
    field: "shippingPolicy"
  },
  refund: {
    title: "Refund Policy",
    icon: RefreshCw,
    description: "Our commitment to your satisfaction with easy returns and refunds.",
    field: "refundPolicy"
  },
  privacy: {
    title: "Privacy Policy",
    icon: Shield,
    description: "How we protect your data and respect your privacy.",
    field: "privacyPolicy"
  },
  terms: {
    title: "Terms of Service",
    icon: FileText,
    description: "The legal guidelines for using our platform and purchasing products.",
    field: "termsOfService"
  }
};

export default function PolicyClient({ staticSlug }) {
  const params = useParams();
  const slug = staticSlug || params?.slug;
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/policies?type=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.policy || "");
        } else {
          setContent("");
        }
      } catch (err) {
        console.error("Error loading policy:", err);
        setContent("");
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [slug]);

  const policy = POLICY_METADATA[slug];
  if (!policy) {
    return (
       <div className="min-h-screen flex items-center justify-center">
          <p>Policy not found.</p>
       </div>
    );
  }

  const Icon = policy.icon;
  const displayContent = loading 
    ? "Loading policy..." 
    : (content && content.trim() 
        ? content 
        : "This policy is being updated. Please check back soon.");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
           <motion.button 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             onClick={() => router.back()}
             className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group"
           >
             <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
             <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
           </motion.button>

           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4"
                 >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Document</span>
                 </motion.div>
                 <motion.h1 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase"
                 >
                   {policy.title}
                 </motion.h1>
              </div>
           </div>

           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="prose prose-invert max-w-none bg-card border border-border p-8 lg:p-12 rounded-[2rem] shadow-sm"
           >
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                 {displayContent}
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="mt-12 text-center"
           >
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                 Last updated: {new Date().toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
           </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

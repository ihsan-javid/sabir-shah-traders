"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";
import { formatPKR } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";
import { FlowButton } from "@/components/ui/flow-button";

import { useWishlist } from "@/lib/wishlist";

export function ProductCard({ product, index = 0 }) {
  const outOfStock = product.stock === 0;
  const cart = useCart();
  const wishlist = useWishlist();
  
  // Mock sizes for UI demonstration based on product category
  const sizes = product.subCategory === "protein" || product.subCategory === "mass-gainer" 
    ? ["1KG", "2KG", "5KG"] 
    : ["30 CAPS", "60 CAPS", "90 CAPS"];
    
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const isLiked = wishlist.has(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    cart.add(product, 1);
    toast.success(`Added ${product.name} (${selectedSize}) to cart`);
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlist.toggle(product);
    if (added) {
      toast.success(`Added ${product.name} to wishlist`);
    } else {
      toast.info(`Removed ${product.name} from wishlist`);
    }
  };

  const handleSizeSelect = (e, size) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(size);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.7, 
        delay: index * 0.08, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
        when: "beforeChildren"
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm hover:shadow-elevated transition-all duration-500 border border-border"
    >
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />

      {product.badge && !outOfStock && (
        <motion.div variants={childVariants} className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-foreground text-background z-20">
          {product.badge}
        </motion.div>
      )}
      {outOfStock && (
        <motion.div variants={childVariants} className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-destructive text-destructive-foreground z-20">
          Out of Stock
        </motion.div>
      )}

      <button 
        onClick={handleLike}
        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-background shadow-sm border border-border grid place-items-center hover:scale-110 active:scale-90 transition-all z-30 pointer-events-auto"
      >
        <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-surface z-0">
        <div className="absolute inset-0 flex items-center justify-center ">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
              product.hoverImage ? "group-hover:opacity-0" : "group-hover:scale-110"
            } ${outOfStock ? "grayscale opacity-60" : ""}`}
          />
        </div>
        
        {product.hoverImage && (
          <div className="absolute inset-0  flex items-center justify-center pointer-events-none">
            <img
              src={product.hoverImage}
              alt={`${product.name} alternative view`}
              loading="lazy"
              className={`h-full w-full object-contain opacity-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-100 group-hover:scale-110 ${
                outOfStock ? "grayscale opacity-60" : ""
              }`}
            />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 z-20 pointer-events-none bg-card">
        <motion.h3 variants={childVariants} className="font-display text-2xl font-bold leading-tight text-foreground">
          {product.name}
        </motion.h3>
        <motion.p variants={childVariants} className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </motion.p>

        <motion.div variants={childVariants} className="mt-4 flex items-center gap-2 pointer-events-auto">
          {sizes.map(size => (
            <button
              key={size}
              onClick={(e) => handleSizeSelect(e, size)}
              className={`relative h-7 px-3 rounded-full text-[10px] font-bold tracking-wider transition-colors border ${
                selectedSize === size 
                  ? "text-background border-transparent" 
                  : "text-muted-foreground border-border hover:border-foreground"
              }`}
            >
              {selectedSize === size && (
                <motion.div
                  layoutId={`size-bg-${product._id}`}
                  className="absolute inset-0 bg-foreground rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{size}</span>
            </button>
          ))}
        </motion.div>

        <motion.div variants={childVariants} className="mt-auto pt-6 flex items-center justify-between pointer-events-auto">
          <div className="font-display text-2xl font-bold tracking-tight">
            {formatPKR(product.price)}
          </div>
          
          <FlowButton
            text="Add to cart"
            onClick={handleAddToCart}
            disabled={outOfStock}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

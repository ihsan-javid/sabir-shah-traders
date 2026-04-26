"use client";

import React from "react";
import { cn } from "@/lib/utils";

const VerifyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 48 48"
    className="inline-block"
  >
    <polygon
      fill="#42a5f5"
      points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"
    ></polygon>
    <polygon
      fill="#fff"
      points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"
    ></polygon>
  </svg>
);

const ReviewCard = ({ card }) => (
  <div className="p-5 rounded-2xl mx-4 shadow-sm border border-border hover:shadow-elevated transition-all duration-300 w-80 shrink-0 bg-card group">
    <div className="flex gap-3">
      <img className="size-12 rounded-full object-cover ring-2 ring-primary/10" src={card.image} alt={card.name} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-foreground">{card.name}</p>
          <VerifyIcon />
        </div>
        <span className="text-xs text-muted-foreground">{card.handle}</span>
      </div>
    </div>
    <p className="text-sm pt-4 text-muted-foreground leading-relaxed italic">
      "{card.text}"
    </p>
  </div>
);

function MarqueeRow({
  data,
  reverse = false,
  speed = 40,
}) {
  const doubled = React.useMemo(() => [...data, ...data, ...data], [data]);
  return (
    <div className="relative w-full overflow-hidden py-2">
      <div
        className={cn(
          "flex transform-gpu min-w-max",
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {doubled.map((c, i) => (
          <ReviewCard key={i} card={c} />
        ))}
      </div>
    </div>
  );
}

const DEFAULT_DATA = [
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    name: "Ahmed Hassan",
    handle: "@ahmed_fit",
    text: "The gold standard whey is 100% authentic. Verified the scratch code myself. Best supplements in Pakistan!"
  },
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    name: "Zainab Malik",
    handle: "@zainab_wellness",
    text: "Amazing customer service and fast delivery to Lahore. The vitamins really helped with my energy levels."
  },
  {
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200",
    name: "Omar Farooq",
    handle: "@omar_tech",
    text: "Ordered a pair of Sony headphones. Authentic product and very well packaged. Five stars!"
  },
  {
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    name: "Sana Javed",
    handle: "@sana_nutrition",
    text: "Sabir Shah Traders is my go-to for all my nutrition needs. Trustworthy and reliable service every time."
  },
  {
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200",
    name: "Bilal Khan",
    handle: "@bilal_gym",
    text: "Finally found a place where I don't have to worry about fake supplements. Fast shipping to Karachi too!"
  },
  {
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200",
    name: "Fatima Ali",
    handle: "@fatima_lifestyle",
    text: "The pre-workout is insane! Great price and the delivery was quicker than expected."
  }
];

export function ReviewMarquee({
  row1 = DEFAULT_DATA.slice(0, 3),
  row2 = DEFAULT_DATA.slice(3, 6),
}) {
  return (
    <div className="flex flex-col gap-6 py-10 relative overflow-hidden">
      {/* Gradients to fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-24 md:w-64 z-10 bg-gradient-to-r from-background via-background/50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-24 md:w-64 z-10 bg-gradient-to-l from-background via-background/50 to-transparent" />
      
      <MarqueeRow data={row1} reverse={false} speed={50} />
      <MarqueeRow data={row2} reverse={true} speed={60} />
    </div>
  );
}

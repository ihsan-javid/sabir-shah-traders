"use client";

import { useRef } from "react";
import { usePreloader } from "./PreloaderProvider";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export function PageTransition({ children }) {
  const { showPageContent } = usePreloader();
  const pathname = usePathname();
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (showPageContent) {
        // 1. Smoothly reveal and slide up the main container
        gsap.to(containerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        // 2. Centralized GSAP stagger reveal for all pages except the homepage
        const isHomepage = pathname === "/";
        if (!isHomepage && containerRef.current) {
          const elements = containerRef.current.children;
          
          if (elements && elements.length > 0) {
            gsap.set(elements, { opacity: 0, y: 15 });
            gsap.to(elements, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.1,
            });
          }
        }
      } else {
        // Instantly hide and offset during preloader active phase
        gsap.set(containerRef.current, {
          opacity: 0,
          y: 15,
        });

        // Instantly reset target children
        const isHomepage = pathname === "/";
        if (!isHomepage && containerRef.current) {
          const elements = containerRef.current.children;
          if (elements && elements.length > 0) {
            gsap.set(elements, { opacity: 0, y: 15 });
          }
        }
      }
    },
    { scope: containerRef, dependencies: [showPageContent, pathname] }
  );

  return (
    <div
      ref={containerRef}
      style={{
        opacity: 0,
        transform: "translateY(15px)",
        // Using visibility hidden during loading prevents accidental tab-focus or interaction
        visibility: showPageContent ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
}

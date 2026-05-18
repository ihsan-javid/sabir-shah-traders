"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Preloader() {
  const [removed, setRemoved] = useState(false);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      setRemoved(true);
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Total duration: 0.3s fade-in + 1.2s count + 0.5s hold + 0.6s exit = ~2.6s
    // We remove the DOM element after the CSS exit animation completes
    const t = setTimeout(() => {
      setRemoved(true);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }, 2700);

    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isAdmin]);

  if (removed) return null;

  return (
    <>
      <div className="preloader-screen">
        {/* Main Logo */}
        <div className="preloader-logo-wrap">
          <div className="preloader-logo-inner">
            <div className="font-display preloader-title">Sabir Shah</div>
            <div className="preloader-subtitle">Traders</div>
          </div>
        </div>

        {/* Bottom Counter — fully CSS animated */}
        <div className="preloader-counter">
          <span className="preloader-counter-label">Loading</span>
          <span className="font-display preloader-counter-number" />
        </div>

        {/* Noise Texture */}
        <div className="absolute inset-0 noise opacity-[0.03] pointer-events-none" />
      </div>

      <style>{`
        @property --num {
          syntax: '<integer>';
          initial-value: 0;
          inherits: false;
        }

        .preloader-screen {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          animation: preloaderExit 0.8s cubic-bezier(0.83, 0, 0.17, 1) 1.9s forwards;
        }

        .preloader-logo-wrap {
          overflow: hidden;
          padding: 0 2.5rem;
        }

        .preloader-logo-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: preloaderTextSlideUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }

        .preloader-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .preloader-subtitle {
          font-size: clamp(0.7rem, 1.5vw, 0.875rem);
          letter-spacing: 1.2em;
          color: var(--primary, #1E7A46);
          margin-top: 1rem;
          text-transform: uppercase;
          font-weight: 500;
        }

        .preloader-counter {
          position: absolute;
          bottom: 3rem;
          right: 3rem;
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .preloader-counter-label {
          color: rgba(255,255,255,0.2);
          font-size: 10px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          animation: preloaderFadeIn 0.5s ease 0.3s both;
        }

        .preloader-counter-number {
          font-size: clamp(3.5rem, 8vw, 5rem);
          font-weight: 300;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          animation: preloaderCount 1.5s ease-out 0.3s forwards;
          counter-set: num var(--num);
        }

        .preloader-counter-number::after {
          content: counter(num);
        }

        @keyframes preloaderCount {
          from { --num: 0; }
          to   { --num: 100; }
        }

        @keyframes preloaderTextSlideUp {
          from { transform: translateY(120px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        @keyframes preloaderFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes preloaderExit {
          from { transform: translateY(0); }
          to   { transform: translateY(-100%); }
        }
      `}</style>
    </>
  );
}

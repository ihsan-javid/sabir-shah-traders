"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Camera } from "lucide-react";
import { TextButton } from "@/components/ui/text-button";
import { Magnetic } from "@/components/ui/magnetic";
import { useStoreSettings } from "@/components/StoreSettingsProvider";

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  const { settings } = useStoreSettings();

  if (pathname.startsWith("/admin")) return null;

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/supplements" },
      { name: "Nutrition", href: "/supplements" },
      { name: "Electronics", href: "/electronics" },
      { name: "Featured", href: "/" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
        ],
    support: [
      { name: "Shipping Policy", href: "/policies/shipping" },
      { name: "Refund Policy", href: "/policies/refund" },
      { name: "Privacy Policy", href: "/policies/privacy" },
      { name: "Terms of Service", href: "/policies/terms" },
    ],
  };

  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 overflow-hidden border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Top Section: Large CTA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 pb-20 border-b border-white/10">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
            >
              HAVE A QUESTION? <br />
              <span className="text-primary">LET&apos;S TALK.</span>
            </motion.h2>
            <p className="mt-6 text-gray-400 text-lg max-w-md">
              {settings?.aboutText || "We're here to help you find the perfect supplement or the latest tech. Reach out anytime."}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-shrink-0"
          >
            <TextButton 
              text="WHATSAPP US"
              onClick={() => {
                const num = (settings?.whatsappNumber || "923000000000").replace(/\D/g, "");
                window.open(`https://wa.me/${num}`, "_blank");
              }}
              className="text-lg px-12 py-6 h-auto"
            />
          </motion.div>
        </div>

        {/* Middle Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-20">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Shop</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-8">Social</h4>
            <div className="flex gap-6">
              {[
                { Icon: InstagramIcon, href: settings?.socialLinks?.instagram || "#", label: "Instagram" },
                { Icon: FacebookIcon, href: settings?.socialLinks?.facebook || "#", label: "Facebook" },
                { Icon: WhatsAppIcon, href: settings?.socialLinks?.whatsapp || `https://wa.me/${(settings?.whatsappNumber || "923000000000").replace(/\D/g, "")}`, label: "WhatsApp" }
              ].map(({ Icon, href, label }, i) => (
                <a 
                  key={i}
                  href={href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-3 rounded-full border border-white/10 hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Branding & Copyright */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <h3 className="text-2xl font-display font-bold tracking-tighter uppercase">
              {(settings?.storeName || "Sabir Shah Traders").toLowerCase()}{" "}
              <span className="text-primary text-[10px] align-top ml-1">®</span>
            </h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">
              {settings?.deliveryInfo || "Premium Nutrition & Electronics"}
            </p>
          </div>
          <div className="flex items-center gap-8 text-[10px] text-gray-500 uppercase tracking-widest">
            <p>{settings?.footerCopyright || `© ${currentYear} ALL RIGHTS RESERVED`}</p>
            <div className="flex gap-4">
              <Link href="/policies/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/policies/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

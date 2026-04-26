"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MessageCircle, ArrowRight, Camera, Globe, X } from "lucide-react";
import { TextButton } from "@/components/ui/text-button";
import { Magnetic } from "@/components/ui/magnetic";

export function Footer() {
  const pathname = usePathname();
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
      { name: "Reviews", href: "/#reviews" },
      { name: "Wholesale", href: "/contact" },
    ],
    support: [
      { name: "Shipping Policy", href: "/shipping" },
      { name: "Refund Policy", href: "/refunds" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
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
              We&apos;re here to help you find the perfect supplement or the latest tech. Reach out anytime.
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
              onClick={() => window.open("https://wa.me/923000000000", "_blank")}
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
                { Icon: Camera, href: "#" },
                { Icon: X, href: "#" },
                { Icon: Globe, href: "#" }
              ].map(({ Icon, href }, i) => (
                <a 
                  key={i}
                  href={href} 
                  className="p-3 rounded-full border border-white/10 hover:border-primary hover:text-primary transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="mt-10">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Newsletter</p>
              <div className="relative border-b border-white/20 pb-2 group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-600 focus:placeholder:text-gray-400 transition-all"
                />
                <ArrowRight className="absolute right-0 top-0 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Branding & Copyright */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <h3 className="text-2xl font-display font-bold tracking-tighter uppercase">
              sabir shah <span className="text-primary text-[10px] align-top ml-1">®</span>
            </h3>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">
              Premium Nutrition & Electronics
            </p>
          </div>
          <div className="flex items-center gap-8 text-[10px] text-gray-500 uppercase tracking-widest">
            <p>© {currentYear} ALL RIGHTS RESERVED</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

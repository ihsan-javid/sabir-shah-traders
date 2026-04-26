import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toaster } from "sonner";

export const metadata = {
  title: "Sabir Shah Traders — Premium Electronics & Supplements",
  description:
    "Pakistan's trusted online store for premium electronics and authentic food supplements. Cash on delivery available.",
  openGraph: {
    title: "Sabir Shah Traders — Premium Electronics & Supplements",
    description:
      "Shop premium electronics & authentic supplements with fast delivery across Pakistan.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SmoothScroll />
          <div className="fixed top-0 inset-x-0 z-[100]">
            <AnnouncementBar />
            <Header />
          </div>
          <main className="min-h-screen pt-24">{children}</main>
          <Footer />
          <WhatsAppFab />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

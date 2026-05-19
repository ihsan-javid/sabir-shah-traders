import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Toaster } from "sonner";
import { Preloader } from "@/components/Preloader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StoreSettingsProvider } from "@/components/StoreSettingsProvider";
import { MaintenanceGuard } from "@/components/MaintenanceGuard";
import { PreloaderProvider } from "@/components/PreloaderProvider";
import { PageTransition } from "@/components/PageTransition";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PreloaderProvider>
          <StoreSettingsProvider>
            <Preloader />
            <ThemeProvider defaultTheme="light">
              <SmoothScroll />
              <div className="fixed top-0 inset-x-0 z-[100]">
                <AnnouncementBar />
                <Header />
              </div>
              <main className="min-h-screen">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <WhatsAppFab />
              <Toaster />
            </ThemeProvider>
          </StoreSettingsProvider>
        </PreloaderProvider>
      </body>
    </html>
  );
}

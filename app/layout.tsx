import type { Metadata, Viewport } from "next";
import { Anton, Space_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ChatWidget from "@/components/ChatWidget";
import { Footer } from "@/components/Sections";
import { CartProvider } from "@/lib/cart";
import { AssetProvider } from "@/lib/assets";
import Preloader from "@/components/Preloader";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--f-display" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-mono" });
const body = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-body" });

export const metadata: Metadata = {
  title: "ONEZ Shoes — Made in Pakistan. Unbox the 1997.",
  description: "ONEZ designs, manufactures and sells sneakers in Pakistan. Open the box, find your pair, order on WhatsApp.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#15100c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${anton.variable} ${mono.variable} ${body.variable}`}><AssetProvider>
        <Preloader />
        <CartProvider>
          <SmoothScroll />
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <ChatWidget />
        </CartProvider>
        </AssetProvider>
      </body>
    </html>
  );
}

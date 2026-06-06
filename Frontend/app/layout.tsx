import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import HeaderWrapper from "../components/HeaderWrapper"; 
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { cn } from "@/lib/utils";

const bevietnam = Be_Vietnam_Pro({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "FruiTaste - Hoa quả tươi sạch",
  description: "Cửa hàng hoa quả tươi ngon, giao hàng nhanh chóng, mang hương vị thiên nhiên đến tận tay bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", bevietnam.variable)}>
      <body className="font-sans antialiased max-w-[100vw] overflow-x-hidden bg-[#FFFDFB]">
        <AuthProvider>
          <HeaderWrapper />
          {children}
          <Footer />
          <Toaster />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

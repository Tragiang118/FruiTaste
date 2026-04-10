import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import HeaderWrapper from "../components/HeaderWrapper"; 
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "FruiTaste - Trái Cây Tươi Sạch",
  description: "Cửa hàng trái cây tươi mát, chất lượng, đảm bảo dinh dưỡng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased max-w-[100vw] overflow-x-hidden bg-[#FFFDFB]">
        <AuthProvider>
          <HeaderWrapper />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

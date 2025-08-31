import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ishq-e-Libas - Women's Fashion & Ethnic Wear",
  description: "Discover exquisite women's fashion at Ishq-e-Libas. Shop premium sarees, kurtis, lehengas, and custom blouses. Free shipping on orders above ₹999.",
  keywords: ["Ishq-e-Libas", "women's fashion", "ethnic wear", "sarees", "kurtis", "lehengas", "custom blouses", "Indian fashion", "online shopping"],
  authors: [{ name: "Ishq-e-Libas Team" }],
  openGraph: {
    title: "Ishq-e-Libas - Women's Fashion & Ethnic Wear",
    description: "Discover exquisite women's fashion at Ishq-e-Libas. Shop premium sarees, kurtis, lehengas, and custom blouses.",
    url: "https://ishqelibas.com",
    siteName: "Ishq-e-Libas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ishq-e-Libas - Women's Fashion & Ethnic Wear",
    description: "Discover exquisite women's fashion at Ishq-e-Libas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
            <Footer />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

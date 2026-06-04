import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kapruka AI — Smart Shopping Assistant",
  description:
    "Your personal AI-powered shopping assistant for Kapruka, Sri Lanka's premier e-commerce platform. Discover gifts, cakes, flowers and more.",
  keywords: ["Kapruka", "Sri Lanka", "shopping", "AI", "gifts", "e-commerce"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

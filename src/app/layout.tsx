import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="en" className={`${inter.variable} ${notoSinhala.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tahfizh Kuttab ZAD",
  description: "Aplikasi Rekap Al-Quran Kuttab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader
          color="#800000"
          height={3}
          showSpinner={false}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          speed={400}
          crawlSpeed={200}
          shadow="0 0 10px #800000, 0 0 5px #800000"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

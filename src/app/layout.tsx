import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
    <html lang="id" className={jakarta.variable}>
      <body
        className="antialiased"
      >
        <NextTopLoader
          color="#b73b3b"
          height={3}
          showSpinner={false}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          speed={400}
          crawlSpeed={200}
          shadow="0 0 10px #b73b3b, 0 0 5px #b73b3b"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

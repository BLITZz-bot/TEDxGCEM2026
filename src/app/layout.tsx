import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEDxGCEM | Ideas Worth Spreading",
  description: "Official website for TEDxGCEM event. Join us for a day of inspiring talks and new perspectives.",
  icons: {
    icon: [
      {
        url: "/logo-black.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-white.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

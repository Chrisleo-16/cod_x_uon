import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";

/** COD Hitmarker Text — UI / body / forms */
const hitmarkerText = localFont({
  src: [
    {
      path: "../fonts/hitmarker/HitmarkerText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerText-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerText-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerText-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

/** COD Hitmarker Condensed — titles / game chrome */
const hitmarkerDisplay = localFont({
  src: [
    {
      path: "../fonts/hitmarker/HitmarkerCondensed-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerCondensed-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerCondensed-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/hitmarker/HitmarkerCondensed-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "UoN Call of Duty Tournament | Register",
  description:
    "University of Nairobi Call of Duty Mobile Tournament registration — ONUSS · Chiromo Campus · 26 September 2026",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hitmarkerText.variable} ${hitmarkerDisplay.variable} h-full`}
    >
      <body className={`${hitmarkerText.className} min-h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}

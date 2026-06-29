import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Elegant display serif for premium headlines
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const siteDescription =
  "Pure, raw, traceable Rwandan honey — shop online, order wholesale, and run your point-of-sale. Harvested in Rwanda, delivered fresh.";

export const metadata: Metadata = {
  title: {
    default: "Drone Bee | Pure Natural Rwandan Honey",
    template: "%s | Drone Bee",
  },
  description: siteDescription,
  applicationName: "Drone Bee",
  keywords: ["honey", "Rwandan honey", "raw honey", "natural honey", "wholesale honey", "Drone Bee", "Rwanda", "Kigali"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Drone Bee" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }, { url: "/favicon.ico" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    title: "Drone Bee | Pure Natural Rwandan Honey",
    description: siteDescription,
    siteName: "Drone Bee",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Drone Bee — Pure Rwandan Honey" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drone Bee | Pure Natural Rwandan Honey",
    description: siteDescription,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#171B2C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased`}
      >
        {children}
        <PWARegister />
      </body>
    </html>
  );
}

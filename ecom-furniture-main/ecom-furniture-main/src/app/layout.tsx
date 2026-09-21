import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ToastContainer } from "@/components/ui/Toast";
import BackToTop from "@/components/home/BackToTop";
import ScrollProgress from "@/components/ui/ScrollProgress";
import DirectionSync from "@/components/layout/DirectionSync";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Analytics from "@/components/analytics/Analytics";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const siteUrl = "https://woodcraft.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1C1917",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amazon Furniture | Premium Handcrafted Furniture",
    template: "%s | Amazon Furniture",
  },
  description:
    "Premium handcrafted furniture for modern living. Discover our curated collection of sofas, tables, chairs, beds, and more.",
  keywords: [
    "furniture",
    "handcrafted furniture",
    "premium furniture",
    "sofas",
    "dining tables",
    "bedroom furniture",
    "modern furniture",
    "wood furniture",
    "online furniture shop",
  ],
  authors: [{ name: "Amazon Furniture" }],
  creator: "Amazon Furniture",
  publisher: "Amazon Furniture",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Amazon Furniture",
    title: "Amazon Furniture | Premium Handcrafted Furniture",
    description:
      "Premium handcrafted furniture for modern living. Explore sofas, tables, chairs, and more.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 559,
        alt: "Amazon Furniture — Premium Handcrafted Furniture",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon Furniture | Premium Handcrafted Furniture",
    description:
      "Premium handcrafted furniture for modern living. Explore sofas, tables, chairs, and more.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/logo-icon.png" />
        <link rel="canonical" href={siteUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-sans overflow-x-hidden w-full pb-16 md:pb-0">
        <DirectionSync />
        <Analytics />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastContainer />
        <BackToTop />
        <WhatsAppButton />
        <MobileBottomNav />
      </body>
    </html>
  );
}

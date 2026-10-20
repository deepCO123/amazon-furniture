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
import ProductInitializer from "@/components/layout/ProductInitializer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

// TODO: Update this to your actual production domain before going live
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://amazonfurniture.eg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1C1917",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AMAZON | Premium Living Solutions",
    template: "%s | AMAZON",
  },
  description:
    "AMAZON – Premium Living Solutions. أرقى تشكيلات الأثاث الفاخر وحلول المعيشة العصرية للمنازل والمكاتب بأعلى معايير الجودة والتصميم.",
  keywords: [
    "AMAZON",
    "Premium Living Solutions",
    "furniture",
    "أثاث فاخر",
    "handcrafted furniture",
    "modern furniture",
    "sofas",
    "luxury furniture Egypt",
  ],
  authors: [{ name: "AMAZON" }],
  creator: "AMAZON",
  publisher: "AMAZON",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    siteName: "AMAZON",
    title: "AMAZON | Premium Living Solutions",
    description:
      "AMAZON – Premium Living Solutions. أرقى تشكيلات الأثاث الفاخر وحلول المعيشة العصرية.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "AMAZON – Premium Living Solutions",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AMAZON | Premium Living Solutions",
    description:
      "AMAZON – Premium Living Solutions. أرقى تشكيلات الأثاث الفاخر وحلول المعيشة العصرية.",
    images: ["/opengraph-image.png"],
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AMAZON",
    "alternateName": "AMAZON – Premium Living Solutions",
    "url": siteUrl,
    "logo": `${siteUrl}/logo/amazon-horizontal-bronze.svg`,
    "image": `${siteUrl}/opengraph-image.png`,
    "description": "AMAZON – Premium Living Solutions",
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} font-sans h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="canonical" href={siteUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('amazon-furniture-theme');var theme=t?JSON.parse(t).state.theme:'light';document.documentElement.classList.add(theme);document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface font-sans overflow-x-hidden w-full pb-16 md:pb-0">
        <ProductInitializer />
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

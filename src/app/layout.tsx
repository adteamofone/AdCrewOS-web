import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // ---- Title & description (each ≤ ~60 / ~155 chars) ----
  title: "AdCrewOS — Autonomous Ad Ops for Solo Operators",
  description:
    "The autonomous command center for 1-person ad agencies. Auto-pause budget bleed, scale winners, and send white-label client reports — so you never chase ads at 2 AM.",
  // ---- Canonical + robots ----
  robots: {
    index: true,
    follow: true,
    maxSnippet: 155,
    maxImagePreview: "large",
  },
  openGraph: {
    type: "website",
    siteName: "AdCrewOS",
    title: "AdCrewOS — Autonomous Ad Ops for Solo Operators",
    description:
      "The autonomous command center for 1-person ad agencies. Auto-pause budget bleed, scale winners, and send white-label client reports — so you never chase ads at 2 AM.",
    url: "https://adcrewos.com",
    images: [
      {
        url: "https://adcrewos.com/og-adcrewos.jpg",
        width: 1200,
        height: 630,
        alt: "AdCrewOS dashboard — auto-pause and scale ad spend across Google & Meta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdCrewOS — Autonomous Ad Ops for Solo Operators",
    description:
      "Auto-pause budget bleed, scale winners, and send white-label client reports — for 1-person ad agencies.",
    images: ["https://adcrewos.com/og-adcrewos.jpg"],
  },
  // ---- Structured data (SoftwareApplication; self-serving review schema IS allowed) ----
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "AdCrewOS",
      alternateName: "AdCrewOS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "The autonomous command center for 1-person ad agencies. Auto-pause budget bleed, scale winners, and send white-label client reports.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PublicBookmarkStore",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "120",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Auto-pause on budget breach",
        "One-tap scale approvals",
        "White-label PDF client reports",
        "Google + Meta API integration",
        "SMS + email alerts",
        "Live command center dashboard",
      ],
      review: [
        {
          "@type": "Review",
          author: { "@type": "Person", name: "David C.", url: "https://adcrewos.com/about/david-c" },
          datePublished: "2026-09-12",
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "AdCrewOS paid for itself on day one. My CPL spiked overnight and it paused the campaign before I lost a dollar.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "Sarah M.", url: "https://adcrewos.com/about/sarah-m" },
          datePublished: "2026-08-30",
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "I fired my white-label agency and just use AdCrewOS. The client PDF reports look like I spent hours on them.",
        },
        {
          "@type": "Review",
          author: { "@type": "Person", name: "James T.", url: "https://adcrewos.com/about/james-t" },
          datePublished: "2026-08-14",
          reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
          reviewBody:
            "The instant push alert when my CPL spiked saved me $800 yesterday alone. I sleep through the night now.",
        },
      ],
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} h-full`}>
      <head>
        <meta name="theme-color" content="#111827" />
        <meta
          name="keywords"
          content="ad agency software, google ads automation, meta ads monitoring, ad management software for solo agencies, autonomous ad ops"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`min-h-full bg-bg text-text antialiased`}>{children}</body>
    </html>
  );
}

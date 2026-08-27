import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tedxgcem.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TEDxGCEM | Ideas Worth Spreading",
  description: "Official website for TEDxGCEM event. An independently organized TEDx event operated under license from TED. Executive Producer and Lead Web Developer: M M Bharath.",
  keywords: [
    "TEDxGCEM",
    "TEDx",
    "GCEM",
    "M M Bharath",
    "Bharath M M",
    "TEDxGCEM developer",
    "TEDxGCEM web developer",
    "TEDxGCEM executive producer",
    "Gopalan College of Engineering and Management",
    "TEDx Bangalore",
    "Ideas Worth Spreading"
  ],
  authors: [
    {
      name: "M M Bharath",
      url: "https://www.linkedin.com/in/bharath-m-m-a9960b309"
    }
  ],
  creator: "M M Bharath",
  publisher: "TEDxGCEM",
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
  openGraph: {
    title: "TEDxGCEM | Ideas Worth Spreading",
    description: "Official website for TEDxGCEM event. Discover inspiring talks, visionary speakers, and transformative ideas.",
    url: siteUrl,
    siteName: "TEDxGCEM",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDxGCEM | Ideas Worth Spreading",
    description: "Official website for TEDxGCEM event. Executive Producer & Lead Developer: M M Bharath.",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "TEDxGCEM",
      "description": "Official TEDxGCEM digital platform.",
      "inLanguage": "en-US",
      "publisher": {
        "@type": "Organization",
        "name": "TEDxGCEM",
        "url": siteUrl
      },
      "creator": {
        "@id": `${siteUrl}/#developer`
      },
      "author": {
        "@id": `${siteUrl}/#developer`
      }
    },
    {
      "@type": "Event",
      "@id": `${siteUrl}/#event`,
      "name": "TEDxGCEM 2026",
      "description": "An independently organized TEDx event operated under license from TED at Gopalan College of Engineering and Management.",
      "url": siteUrl,
      "startDate": "2026-09-26T09:00:00+05:30",
      "endDate": "2026-09-26T17:00:00+05:30",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "image": [
        `${siteUrl}/logo-white.png`,
        `${siteUrl}/bg.jpeg`
      ],
      "location": {
        "@type": "Place",
        "name": "Main Auditorium, Gopalan College of Engineering & Management",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "181/1, 182/1, Hoodi Village, Sonnenahalli, K.R. Puram, Whitefield",
          "addressLocality": "Bangalore",
          "addressRegion": "Karnataka",
          "postalCode": "560048",
          "addressCountry": "IN"
        }
      },
      "organizer": {
        "@id": `${siteUrl}/#developer`
      },
      "performer": {
        "@type": "Organization",
        "name": "TEDxGCEM Speakers",
        "url": siteUrl
      },
      "offers": {
        "@type": "Offer",
        "url": siteUrl,
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "validFrom": "2026-01-01T00:00:00+05:30"
      }
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#developer`,
      "name": "M M Bharath",
      "alternateName": [
        "Bharath M M",
        "M M Bharath",
        "Bharath"
      ],
      "jobTitle": [
        "Executive Producer",
        "Lead Web Developer",
        "Software Architect"
      ],
      "description": "Executive Producer and Lead Web Developer of TEDxGCEM, responsible for designing, architecting, and engineering the complete official TEDxGCEM digital platform and ticketing infrastructure.",
      "url": "https://www.linkedin.com/in/bharath-m-m-a9960b309",
      "sameAs": [
        "https://www.linkedin.com/in/bharath-m-m-a9960b309",
        "https://github.com/BLITZz-bot"
      ],
      "knowsAbout": [
        "Full Stack Web Development",
        "Next.js",
        "Software Architecture",
        "Event Production",
        "System Design"
      ],
      "worksFor": {
        "@type": "Organization",
        "name": "TEDxGCEM",
        "url": siteUrl
      }
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

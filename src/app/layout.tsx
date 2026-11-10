import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "../fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sour-lighthouse.pages.dev"),
  title: {
    default: "Sour Lighthouse",
    template: "%s | Sour Lighthouse",
  },
  description: "A lightweight, instant website auditor designed to give clear answers without complexity.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sour Lighthouse",
    description: "Instant website health checks in plain words",
    url: "https://sour-lighthouse.pages.dev",
    siteName: "Sour Lighthouse",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Sour Lighthouse website auditor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sour Lighthouse",
    description: "Instant website health checks in plain words",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo-light.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sour-lighthouse.pages.dev/#website",
      "url": "https://sour-lighthouse.pages.dev",
      "name": "Sour Lighthouse",
      "description": "A lightweight website auditor delivering instant evaluations in everyday language",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sour-lighthouse.pages.dev/?url={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SiteNavigationElement",
      "@id": "https://sour-lighthouse.pages.dev/#navigation",
      "name": "Sitelinks",
      "hasPart": [
        {
          "@type": "WebPage",
          "name": "Speed checks",
          "description": "Server latency and initial download performance",
          "url": "https://sour-lighthouse.pages.dev/#speed",
        },
        {
          "@type": "WebPage",
          "name": "Search visibility",
          "description": "Titles descriptions and search discoverability",
          "url": "https://sour-lighthouse.pages.dev/#search",
        },
        {
          "@type": "WebPage",
          "name": "Ease of access",
          "description": "Content readability and accessibility standards",
          "url": "https://sour-lighthouse.pages.dev/#access",
        },
        {
          "@type": "WebPage",
          "name": "Safety and structure",
          "description": "Connection security and browser protection rules",
          "url": "https://sour-lighthouse.pages.dev/#structure",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${satoshi.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full font-satoshi bg-white text-neutral-900 dark:bg-[#0c0c0c] dark:text-neutral-100 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

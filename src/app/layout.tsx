import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
        url: "/logo-light.png",
        width: 512,
        height: 512,
        alt: "Sour Lighthouse mark",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Sour Lighthouse",
    description: "Instant website health checks in plain words",
    images: ["/logo-light.png"],
  },
  icons: {
    icon: [
      { url: "/logo-light.svg" },
      { url: "/favicon.ico" },
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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full font-inter bg-white text-neutral-900 dark:bg-[#0c0c0c] dark:text-neutral-100 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

"use client";

import React from "react";

const SITELINKS = [
  { name: "Speed", href: "#speed" },
  { name: "Search", href: "#search" },
  { name: "Access", href: "#access" },
  { name: "Structure", href: "#structure" },
];

interface SitelinksNavProps {
  className?: string;
}

export default function SitelinksNav({ className = "" }: SitelinksNavProps) {
  return (
    <nav aria-label="Sitelinks" className={`flex items-center gap-6 ${className}`}>
      {SITELINKS.map((link) => (
        <a
          key={link.name}
          href={link.href}
          className="text-xs font-light text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          {link.name}
        </a>
      ))}
    </nav>
  );
}

"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-neutral-900 dark:text-neutral-100 transition-colors ${className}`}
      aria-hidden="true"
    >
      {/* Light source beacon */}
      <circle cx="32" cy="16" r="3.5" fill="currentColor" stroke="none" />
      {/* Sweeping light rays */}
      <path
        d="M38 15 L54 10 M39 18 L56 20 M38 21 L52 29"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Tower silhouette */}
      <path
        d="M26 24 L38 24 M28 24 L25 50 M36 24 L39 50 M22 50 L42 50"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 35 L34 35" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

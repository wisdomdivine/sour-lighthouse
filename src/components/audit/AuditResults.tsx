"use client";

import React, { useEffect, useRef, useState } from "react";
import { AuditResult } from "@/lib/auditor";
import MetricCard from "../ui/MetricCard";
import AuditSection from "./AuditSection";
import { IconArrowUpRight, IconRefresh } from "@tabler/icons-react";
import gsap from "gsap";

interface AuditResultsProps {
  result: AuditResult;
  onReset: () => void;
}

export default function AuditResults({ result, onReset }: AuditResultsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsGridRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const sectionsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 }
        );
      }

      if (cardsGridRef.current) {
        const cards = cardsGridRef.current.querySelectorAll(".metric-card");
        tl.fromTo(
          cards,
          { opacity: 0, y: 20, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08 },
          "-=0.4"
        );
      }

      if (filtersRef.current) {
        tl.fromTo(
          filtersRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.3"
        );
      }

      if (sectionsListRef.current) {
        const sections = sectionsListRef.current.children;
        tl.fromTo(
          sections,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          "-=0.3"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [result]);

  const displayedCategories =
    selectedCategory === "all"
      ? result.categories
      : result.categories.filter((cat) => cat.key === selectedCategory);

  const totalChecks = result.categories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  const goodChecks = result.categories.reduce(
    (acc, cat) => acc + cat.items.filter((it) => it.verdict === "good").length,
    0
  );

  const attentionChecks = totalChecks - goodChecks;

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-12 sm:gap-16">
      {/* Top Header */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-light uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Website Overview
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-neutral-900 dark:text-neutral-100 break-all leading-tight">
              {result.url}
            </h2>
            <a
              href={result.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open tested website in a new tab"
              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors p-1"
            >
              <IconArrowUpRight size={20} stroke={1.5} />
            </a>
          </div>
          <span className="text-xs font-light text-neutral-400 dark:text-neutral-500">
            Tested at {result.testedAt}
          </span>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="self-start md:self-auto flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-light text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <IconRefresh size={16} stroke={1.5} />
          <span>Test another website</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div
        ref={cardsGridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <MetricCard
          title="Overall health"
          value={result.overallScore}
          unit="%"
          subtitle={`${goodChecks} of ${totalChecks} tests in good standing`}
          sparkline={[60, 75, 70, 85, 90, result.overallScore]}
        />
        <MetricCard
          title="Page response"
          value={result.totalTimeMs}
          unit="ms"
          subtitle="Total roundtrip test duration"
        />
        <MetricCard
          title="Initial weight"
          value={result.pageSizeKb}
          unit="KB"
          subtitle="Size of initial HTML document"
        />
        <MetricCard
          title="Needs attention"
          value={attentionChecks}
          unit="items"
          verdict={attentionChecks > 0 ? "moderate" : "good"}
          subtitle="Opportunities for improvement"
        />
      </div>

      {/* Category Filter Pills */}
      <div
        ref={filtersRef}
        className="flex flex-wrap gap-2 overflow-x-auto pb-1"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-light tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          }`}
        >
          All categories
        </button>
        {result.categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-light tracking-wide transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.key
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            {cat.name} ({cat.score}%)
          </button>
        ))}
      </div>

      {/* Categories Detail List */}
      <div ref={sectionsListRef} className="flex flex-col gap-12 sm:gap-16">
        {displayedCategories.map((category) => (
          <AuditSection key={category.key} category={category} />
        ))}
      </div>
    </div>
  );
}

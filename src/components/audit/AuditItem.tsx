"use client";

import React, { useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { AuditItem as AuditItemType } from "@/lib/auditor";
import gsap from "gsap";

interface AuditItemProps {
  item: AuditItemType;
}

export default function AuditItem({ item }: AuditItemProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);

    if (detailsRef.current) {
      if (next) {
        gsap.fromTo(
          detailsRef.current,
          { opacity: 0, y: -6, height: 0 },
          { opacity: 1, y: 0, height: "auto", duration: 0.35, ease: "power2.out" }
        );
      }
    }
  };

  const verdictLabel =
    item.verdict === "good"
      ? "Good"
      : item.verdict === "moderate"
      ? "Needs improvement"
      : "Requires attention";

  const verdictTextColor =
    item.verdict === "good"
      ? "text-neutral-500 dark:text-neutral-400"
      : item.verdict === "moderate"
      ? "text-amber-600 dark:text-amber-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <div className="audit-item flex flex-col p-5 sm:p-6 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/40 transition-colors">
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left cursor-pointer focus:outline-none"
      >
        <div className="flex flex-col gap-1 pr-2">
          <span className="text-sm sm:text-base font-normal text-neutral-900 dark:text-neutral-100 leading-snug">
            {item.title}
          </span>
          <span className={`text-xs font-light ${verdictTextColor}`}>
            {verdictLabel}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-neutral-400 dark:text-neutral-500 self-stretch sm:self-auto pt-1 sm:pt-0">
          {item.metricValue && (
            <span className="text-xs font-light text-neutral-600 dark:text-neutral-300">
              {item.metricValue}
            </span>
          )}
          {expanded ? (
            <IconChevronUp size={16} stroke={1.5} />
          ) : (
            <IconChevronDown size={16} stroke={1.5} />
          )}
        </div>
      </button>

      <div className="mt-3">
        <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {item.summary}
        </p>

        {expanded && item.recommendation && (
          <div
            ref={detailsRef}
            className="mt-4 p-4 rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 overflow-hidden"
          >
            <span className="block text-xs font-light uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              How to improve
            </span>
            <p className="text-xs font-light text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {item.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

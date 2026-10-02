"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  verdict?: "good" | "moderate" | "attention";
  sparkline?: number[];
  className?: string;
}

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  verdict,
  sparkline,
  className = "",
}: MetricCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const polylineRef = useRef<SVGPolylineElement>(null);

  const verdictColor =
    verdict === "good"
      ? "text-neutral-900 dark:text-neutral-100"
      : verdict === "moderate"
      ? "text-amber-600 dark:text-amber-400"
      : verdict === "attention"
      ? "text-rose-600 dark:text-rose-400"
      : "text-neutral-900 dark:text-neutral-100";

  useEffect(() => {
    if (typeof value === "number" && numberRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = Math.round(obj.val).toString();
          }
        },
      });
    }

    if (polylineRef.current) {
      const length = polylineRef.current.getTotalLength?.() || 120;
      gsap.fromTo(
        polylineRef.current,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.4, ease: "power2.out", delay: 0.2 }
      );
    }
  }, [value]);

  return (
    <div
      ref={cardRef}
      className={`metric-card flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 transition-colors ${className}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-light uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {title}
        </span>
      </div>

      <div className="my-5 sm:my-6 flex items-baseline gap-1">
        <span
          ref={numberRef}
          className={`text-4xl sm:text-5xl font-light tracking-tight ${verdictColor}`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-base sm:text-lg font-light text-neutral-400 dark:text-neutral-500">
            {unit}
          </span>
        )}
      </div>

      {sparkline && sparkline.length > 1 && (
        <div className="w-full h-8 mb-4">
          <svg
            viewBox="0 0 100 24"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <polyline
              ref={polylineRef}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-neutral-400 dark:text-neutral-600"
              points={sparkline
                .map((val, idx) => {
                  const x = (idx / (sparkline.length - 1)) * 100;
                  const y = 24 - (val / 100) * 20;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
        </div>
      )}

      {subtitle && (
        <span className="text-xs font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {subtitle}
        </span>
      )}
    </div>
  );
}

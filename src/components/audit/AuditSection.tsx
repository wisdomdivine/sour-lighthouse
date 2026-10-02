"use client";

import React from "react";
import { AuditCategory } from "@/lib/auditor";
import AuditItem from "./AuditItem";

interface AuditSectionProps {
  category: AuditCategory;
}

export default function AuditSection({ category }: AuditSectionProps) {
  return (
    <section id={category.key} className="flex flex-col gap-6 scroll-mt-12">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-light text-neutral-900 dark:text-neutral-100">
            {category.name}
          </h3>
          <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">
            {category.description}
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-light text-neutral-900 dark:text-neutral-100">
            {category.score}
          </span>
          <span className="text-xs font-light text-neutral-400">/ 100</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {category.items.map((item) => (
          <AuditItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

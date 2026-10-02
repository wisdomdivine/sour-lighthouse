"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CustomInput from "@/components/ui/CustomInput";
import DotLoader from "@/components/ui/DotLoader";
import Logo from "@/components/ui/Logo";
import AuditResults from "@/components/audit/AuditResults";
import { AuditResult } from "@/lib/auditor";
import { IconArrowRight } from "@tabler/icons-react";

const SAMPLE_WEBSITES = [
  "github.com",
  "wikipedia.org",
  "news.ycombinator.com",
  "vercel.com",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleSubmit = async (targetUrl?: string) => {
    const urlToTest = (targetUrl || url).trim();
    if (!urlToTest) {
      setError("Please enter a website address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToTest }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to complete audit");
      }

      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while analyzing the website";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUrl("");
  };

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 dark:bg-[#0c0c0c] dark:text-neutral-100 transition-colors flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div className="flex flex-col">
            <span className="text-lg font-light tracking-wide text-neutral-900 dark:text-neutral-100">
              Lighthouse
            </span>
            <span className="text-xs font-light text-neutral-400 dark:text-neutral-500">
              Lightweight website auditor
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-8 text-center">
            <DotLoader mode="wave" size="medium" />
            <div className="flex flex-col gap-2 max-w-sm">
              <span className="text-base font-normal text-neutral-900 dark:text-neutral-100">
                Auditing website
              </span>
              <span className="text-xs font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Checking server speed, search visibility, ease of access, and page structure
              </span>
            </div>
          </div>
        ) : result ? (
          <AuditResults result={result} onReset={handleReset} />
        ) : (
          <div className="flex flex-col max-w-3xl mx-auto w-full gap-12 py-12">
            {/* Heading */}
            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="text-xs font-light uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Instant website checks
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
                Understand how your website performs.
              </h1>
              <p className="text-base sm:text-lg font-light text-neutral-500 dark:text-neutral-400 max-w-xl">
                Free and open tool to check speed, search friendliness, and accessibility in plain words.
              </p>
            </div>

            {/* URL Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex flex-col sm:flex-row items-stretch gap-3 w-full"
            >
              <div className="flex-1">
                <CustomInput
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. yourwebsite.com"
                  aria-label="Website address to test"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-light text-base transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Run test</span>
                <IconArrowRight size={18} stroke={1.5} />
              </button>
            </form>

            {/* Error notice */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-sm font-light">
                {error}
              </div>
            )}

            {/* Quick sample suggestions */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-light text-neutral-400 dark:text-neutral-500">
                Or try one of these examples
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_WEBSITES.map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setUrl(sample);
                      handleSubmit(sample);
                    }}
                    className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-light text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-neutral-400 dark:text-neutral-600">
        <span>Open use for everyone</span>
        <span>Built with fast lightweight checks</span>
      </footer>
    </div>
  );
}

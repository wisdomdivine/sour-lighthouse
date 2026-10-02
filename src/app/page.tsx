"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CustomInput from "@/components/ui/CustomInput";
import DotLoader from "@/components/ui/DotLoader";
import Logo from "@/components/ui/Logo";
import SitelinksNav from "@/components/ui/SitelinksNav";
import AuditResults from "@/components/audit/AuditResults";
import { AuditResult } from "@/lib/auditor";
import { IconArrowRight } from "@tabler/icons-react";
import gsap from "gsap";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const samplesRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initial landing page entrance animation
  useEffect(() => {
    if (!result && !loading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (headerRef.current) {
          tl.fromTo(
            headerRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.6 }
          );
        }

        if (heroRef.current) {
          tl.fromTo(
            heroRef.current.children,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
            "-=0.3"
          );
        }

        if (formRef.current) {
          tl.fromTo(
            formRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.3"
          );
        }

        if (samplesRef.current) {
          tl.fromTo(
            samplesRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.2"
          );
        }
      }, containerRef);

      return () => ctx.revert();
    }
  }, [result, loading]);

  // Loading state entrance animation
  useEffect(() => {
    if (loading && loaderRef.current) {
      gsap.fromTo(
        loaderRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [loading]);

  // Check URL query parameter for Google Sitelinks Searchbox
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryUrl = params.get("url");
      if (queryUrl) {
        setUrl(queryUrl);
        handleSubmit(queryUrl);
      }
    }
  }, []);

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
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-white text-neutral-900 dark:bg-[#0c0c0c] dark:text-neutral-100 transition-colors flex flex-col justify-between"
    >
      {/* Top Navigation */}
      <header
        ref={headerRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Logo size={28} />
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-light tracking-wide text-neutral-900 dark:text-neutral-100">
              Lighthouse
            </span>
            <span className="text-[11px] sm:text-xs font-light text-neutral-400 dark:text-neutral-500">
              Lightweight website auditor
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <SitelinksNav className="hidden md:flex" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        {loading ? (
          <div
            ref={loaderRef}
            className="flex flex-col items-center justify-center py-20 sm:py-28 gap-8 text-center"
          >
            <DotLoader mode="wave" size="medium" />
            <div className="flex flex-col gap-2 max-w-sm px-4">
              <span className="text-sm sm:text-base font-normal text-neutral-900 dark:text-neutral-100">
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
          <div className="flex flex-col max-w-3xl mx-auto w-full gap-8 sm:gap-12 py-6 sm:py-12">
            {/* Heading */}
            <div
              ref={heroRef}
              className="flex flex-col gap-3 sm:gap-4 text-center md:text-left"
            >
              <span className="text-[11px] sm:text-xs font-light uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Instant website checks
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
                Understand how your website performs.
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-light text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto md:mx-0">
                Free and open tool to check speed, search friendliness, and accessibility in plain words.
              </p>
            </div>

            {/* URL Input Form */}
            <form
              ref={formRef}
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
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-light text-sm sm:text-base transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Run test</span>
                <IconArrowRight size={18} stroke={1.5} />
              </button>
            </form>

            {/* Error notice */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-light">
                {error}
              </div>
            )}

            {/* Quick sample suggestions */}
            <div ref={samplesRef} className="flex flex-col gap-3">
              <span className="text-[11px] sm:text-xs font-light text-neutral-400 dark:text-neutral-500">
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
                    className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-xs font-light text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
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
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-neutral-400 dark:text-neutral-600">
        <SitelinksNav />
        <span>Open use for everyone</span>
      </footer>
    </div>
  );
}

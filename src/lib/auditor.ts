import * as cheerio from "cheerio";

export interface AuditItem {
  id: string;
  title: string;
  verdict: "good" | "moderate" | "attention";
  summary: string;
  recommendation?: string;
  metricValue?: string;
}

export interface AuditCategory {
  key: "speed" | "search" | "access" | "structure";
  name: string;
  score: number;
  description: string;
  items: AuditItem[];
}

export interface AuditResult {
  url: string;
  finalUrl: string;
  testedAt: string;
  overallScore: number;
  totalTimeMs: number;
  pageSizeKb: number;
  categories: AuditCategory[];
}

export async function runLightweightAudit(targetUrl: string): Promise<AuditResult> {
  let normalizedUrl = targetUrl.trim();
  if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const startTime = Date.now();
  let response: Response;

  try {
    response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 SourLighthouse/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unable to reach website";
    throw new Error(`Could not load ${normalizedUrl}. ${errorMsg}`);
  }

  const responseTimeMs = Date.now() - startTime;
  const finalUrl = response.url || normalizedUrl;
  const isHttps = finalUrl.startsWith("https://");

  const headers = response.headers;
  const contentEncoding = headers.get("content-encoding") || "";
  const isCompressed = /gzip|br|deflate/i.test(contentEncoding);
  const cacheControl = headers.get("cache-control") || "";
  const hasCaching = cacheControl.length > 0;
  const hsts = headers.has("strict-transport-security");
  const csp = headers.has("content-security-policy");
  const xFrame = headers.has("x-frame-options");

  const rawHtml = await response.text();
  const totalDownloadTimeMs = Date.now() - startTime;
  const pageSizeKb = Math.round((new Blob([rawHtml]).size / 1024) * 10) / 10;

  const $ = cheerio.load(rawHtml);

  // Speed checks
  const speedItems: AuditItem[] = [];

  // 1. Response time
  if (responseTimeMs < 600) {
    speedItems.push({
      id: "response-time",
      title: "Server response time",
      verdict: "good",
      summary: `The server responded in ${responseTimeMs} milliseconds which is fast.`,
      metricValue: `${responseTimeMs} ms`,
    });
  } else if (responseTimeMs < 1400) {
    speedItems.push({
      id: "response-time",
      title: "Server response time",
      verdict: "moderate",
      summary: `The server took ${responseTimeMs} milliseconds to respond.`,
      recommendation: "Consider a faster hosting provider, edge caching, or server optimization.",
      metricValue: `${responseTimeMs} ms`,
    });
  } else {
    speedItems.push({
      id: "response-time",
      title: "Server response time",
      verdict: "attention",
      summary: `The server took ${responseTimeMs} milliseconds to respond which is slow.`,
      recommendation: "Enable edge content delivery and check for database delays.",
      metricValue: `${responseTimeMs} ms`,
    });
  }

  // 2. Page weight
  if (pageSizeKb < 150) {
    speedItems.push({
      id: "page-weight",
      title: "Initial page size",
      verdict: "good",
      summary: `Initial document is ${pageSizeKb} KB which is light and quick to download.`,
      metricValue: `${pageSizeKb} KB`,
    });
  } else if (pageSizeKb < 500) {
    speedItems.push({
      id: "page-weight",
      title: "Initial page size",
      verdict: "moderate",
      summary: `Initial document is ${pageSizeKb} KB.`,
      recommendation: "Minify HTML and remove large inline scripts or styles.",
      metricValue: `${pageSizeKb} KB`,
    });
  } else {
    speedItems.push({
      id: "page-weight",
      title: "Initial page size",
      verdict: "attention",
      summary: `Initial document is ${pageSizeKb} KB which can delay loading on phones.`,
      recommendation: "Split large bundles and move inline assets to external cached files.",
      metricValue: `${pageSizeKb} KB`,
    });
  }

  // 3. Compression
  if (isCompressed) {
    speedItems.push({
      id: "compression",
      title: "Content compression",
      verdict: "good",
      summary: `The server compresses files using ${contentEncoding || "gzip/brotli"}.`,
    });
  } else {
    speedItems.push({
      id: "compression",
      title: "Content compression",
      verdict: "attention",
      summary: "The server did not send compressed content for this request.",
      recommendation: "Turn on gzip or brotli compression on your web server to shrink file sizes.",
    });
  }

  // 4. Image dimensions
  const images = $("img");
  let imagesWithoutDimensions = 0;
  images.each((_, el) => {
    const w = $(el).attr("width");
    const h = $(el).attr("height");
    if (!w || !h) imagesWithoutDimensions++;
  });

  if (images.length === 0) {
    speedItems.push({
      id: "image-sizing",
      title: "Image layout stability",
      verdict: "good",
      summary: "No standalone image tags found on the initial page.",
    });
  } else if (imagesWithoutDimensions === 0) {
    speedItems.push({
      id: "image-sizing",
      title: "Image layout stability",
      verdict: "good",
      summary: `All ${images.length} images specify explicit width and height to prevent page jumps.`,
    });
  } else {
    speedItems.push({
      id: "image-sizing",
      title: "Image layout stability",
      verdict: imagesWithoutDimensions > 3 ? "attention" : "moderate",
      summary: `${imagesWithoutDimensions} of ${images.length} images are missing width and height attributes.`,
      recommendation: "Add width and height to all image tags so the browser knows the aspect ratio before loading.",
    });
  }

  // 5. Caching
  if (hasCaching) {
    speedItems.push({
      id: "caching",
      title: "Cache policy",
      verdict: "good",
      summary: "Cache headers are active for incoming visitors.",
    });
  } else {
    speedItems.push({
      id: "caching",
      title: "Cache policy",
      verdict: "moderate",
      summary: "No explicit cache instructions were found on the document.",
      recommendation: "Configure cache headers so repeat visitors load your pages instantly.",
    });
  }

  // Search Visibility (SEO)
  const searchItems: AuditItem[] = [];

  // Title
  const title = $("title").first().text().trim();
  if (title.length >= 15 && title.length <= 70) {
    searchItems.push({
      id: "page-title",
      title: "Page title",
      verdict: "good",
      summary: `Title is present and has a healthy length of ${title.length} characters.`,
    });
  } else if (title.length > 0) {
    searchItems.push({
      id: "page-title",
      title: "Page title",
      verdict: "moderate",
      summary: `Title length is ${title.length} characters. Titles between 20 and 60 characters work best in search results.`,
      recommendation: "Adjust your page title to be descriptive yet concise.",
    });
  } else {
    searchItems.push({
      id: "page-title",
      title: "Page title",
      verdict: "attention",
      summary: "No title tag was found in the page header.",
      recommendation: "Add a descriptive title tag inside the head section.",
    });
  }

  // Description
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  if (metaDesc.length >= 50 && metaDesc.length <= 165) {
    searchItems.push({
      id: "meta-description",
      title: "Search description",
      verdict: "good",
      summary: `Meta description is present with ${metaDesc.length} characters.`,
    });
  } else if (metaDesc.length > 0) {
    searchItems.push({
      id: "meta-description",
      title: "Search description",
      verdict: "moderate",
      summary: `Meta description length is ${metaDesc.length} characters. Between 70 and 160 characters is ideal.`,
      recommendation: "Expand or shorten your meta description for clear search summaries.",
    });
  } else {
    searchItems.push({
      id: "meta-description",
      title: "Search description",
      verdict: "attention",
      summary: "No meta description tag was found.",
      recommendation: "Add a meta description to explain what this page offers to search visitors.",
    });
  }

  // Mobile layout
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  if (viewport.includes("width=device-width")) {
    searchItems.push({
      id: "viewport",
      title: "Mobile screen fit",
      verdict: "good",
      summary: "Mobile viewport configuration is set up properly.",
    });
  } else {
    searchItems.push({
      id: "viewport",
      title: "Mobile screen fit",
      verdict: "attention",
      summary: "Mobile viewport tag is missing or incomplete.",
      recommendation: "Include width=device-width in your viewport meta tag.",
    });
  }

  // Heading structure
  const h1Count = $("h1").length;
  if (h1Count === 1) {
    searchItems.push({
      id: "headings",
      title: "Main heading setup",
      verdict: "good",
      summary: "Page has exactly one main primary heading.",
    });
  } else if (h1Count === 0) {
    searchItems.push({
      id: "headings",
      title: "Main heading setup",
      verdict: "moderate",
      summary: "No primary main heading found on this page.",
      recommendation: "Add a single primary heading that states the main topic.",
    });
  } else {
    searchItems.push({
      id: "headings",
      title: "Main heading setup",
      verdict: "moderate",
      summary: `Found ${h1Count} primary headings. Having just one main heading is clearer.`,
      recommendation: "Keep one primary heading and use subheadings for the rest.",
    });
  }

  // Social sharing
  const ogTitle = $('meta[property="og:title"]').attr("content") || $('meta[name="twitter:title"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content") || $('meta[name="twitter:image"]').attr("content");
  if (ogTitle && ogImage) {
    searchItems.push({
      id: "social-preview",
      title: "Social media preview",
      verdict: "good",
      summary: "Preview title and image are configured for link sharing.",
    });
  } else if (ogTitle || ogImage) {
    searchItems.push({
      id: "social-preview",
      title: "Social media preview",
      verdict: "moderate",
      summary: "Partial social share tags found.",
      recommendation: "Add both preview title and preview image tags for complete share cards.",
    });
  } else {
    searchItems.push({
      id: "social-preview",
      title: "Social media preview",
      verdict: "moderate",
      summary: "No social card tags found.",
      recommendation: "Add OpenGraph or Twitter tags so shared links display neatly on messaging apps.",
    });
  }

  // Ease of Access (Accessibility)
  const accessItems: AuditItem[] = [];

  // Image descriptions
  let imagesWithoutAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined) imagesWithoutAlt++;
  });

  if (images.length === 0) {
    accessItems.push({
      id: "image-alt",
      title: "Image text descriptions",
      verdict: "good",
      summary: "No images on this page needing descriptions.",
    });
  } else if (imagesWithoutAlt === 0) {
    accessItems.push({
      id: "image-alt",
      title: "Image text descriptions",
      verdict: "good",
      summary: `All ${images.length} images have text descriptions for screen readers.`,
    });
  } else {
    accessItems.push({
      id: "image-alt",
      title: "Image text descriptions",
      verdict: "attention",
      summary: `${imagesWithoutAlt} of ${images.length} images are missing text descriptions.`,
      recommendation: "Add alt attributes to all images so assistive devices can describe them.",
    });
  }

  // Document language
  const htmlLang = $("html").attr("lang")?.trim() || "";
  if (htmlLang.length >= 2) {
    accessItems.push({
      id: "doc-lang",
      title: "Page language setting",
      verdict: "good",
      summary: `Document declares language code (${htmlLang}).`,
    });
  } else {
    accessItems.push({
      id: "doc-lang",
      title: "Page language setting",
      verdict: "attention",
      summary: "No language code specified on the root html tag.",
      recommendation: "Add a lang attribute like lang='en' to your html element.",
    });
  }

  // Form input labels
  const inputs = $("input:not([type='hidden']):not([type='submit']):not([type='button'])");
  let inputsWithoutLabels = 0;
  inputs.each((_, el) => {
    const id = $(el).attr("id");
    const ariaLabel = $(el).attr("aria-label") || $(el).attr("aria-labelledby");
    const parentLabel = $(el).closest("label").length > 0;
    const hasLabel = parentLabel || (id && $(`label[for='${id}']`).length > 0) || ariaLabel;
    if (!hasLabel) inputsWithoutLabels++;
  });

  if (inputs.length === 0) {
    accessItems.push({
      id: "form-labels",
      title: "Form input clarity",
      verdict: "good",
      summary: "No interactive form inputs requiring labels found.",
    });
  } else if (inputsWithoutLabels === 0) {
    accessItems.push({
      id: "form-labels",
      title: "Form input clarity",
      verdict: "good",
      summary: `All ${inputs.length} form inputs have clear labels attached.`,
    });
  } else {
    accessItems.push({
      id: "form-labels",
      title: "Form input clarity",
      verdict: "moderate",
      summary: `${inputsWithoutLabels} input fields are missing direct labels.`,
      recommendation: "Connect each input to a visible label element or add an aria label.",
    });
  }

  // Links with text
  const links = $("a");
  let emptyLinks = 0;
  links.each((_, el) => {
    const text = $(el).text().trim();
    const aria = $(el).attr("aria-label") || $(el).attr("title");
    const hasImg = $(el).find("img[alt]").length > 0;
    if (!text && !aria && !hasImg) emptyLinks++;
  });

  if (links.length === 0 || emptyLinks === 0) {
    accessItems.push({
      id: "link-text",
      title: "Clickable link clarity",
      verdict: "good",
      summary: "All links contain clear text or readable descriptions.",
    });
  } else {
    accessItems.push({
      id: "link-text",
      title: "Clickable link clarity",
      verdict: "moderate",
      summary: `${emptyLinks} links have no descriptive text or label.`,
      recommendation: "Make sure all buttons and links contain words describing where they lead.",
    });
  }

  // Structure & Safety
  const structureItems: AuditItem[] = [];

  // HTTPS
  if (isHttps) {
    structureItems.push({
      id: "https-security",
      title: "Secure connection",
      verdict: "good",
      summary: "Page is delivered safely over an encrypted connection.",
    });
  } else {
    structureItems.push({
      id: "https-security",
      title: "Secure connection",
      verdict: "attention",
      summary: "Page is not using a secure encrypted connection.",
      recommendation: "Switch your website to HTTPS with an active security certificate.",
    });
  }

  // Modern webpage format
  const rawLower = rawHtml.slice(0, 200).toLowerCase();
  if (rawLower.includes("<!doctype html>")) {
    structureItems.push({
      id: "doctype",
      title: "Modern webpage standard",
      verdict: "good",
      summary: "Page declares standard modern HTML.",
    });
  } else {
    structureItems.push({
      id: "doctype",
      title: "Modern webpage standard",
      verdict: "moderate",
      summary: "Standard doctype declaration was not detected.",
      recommendation: "Place <!DOCTYPE html> at the very beginning of your page.",
    });
  }

  // Safe external links
  const targetBlanks = $("a[target='_blank']");
  let unsafeLinks = 0;
  targetBlanks.each((_, el) => {
    const rel = $(el).attr("rel") || "";
    if (!rel.includes("noopener") && !rel.includes("noreferrer")) unsafeLinks++;
  });

  if (targetBlanks.length === 0 || unsafeLinks === 0) {
    structureItems.push({
      id: "safe-external-links",
      title: "External link protection",
      verdict: "good",
      summary: "Links opening in new tabs are properly protected.",
    });
  } else {
    structureItems.push({
      id: "safe-external-links",
      title: "External link protection",
      verdict: "moderate",
      summary: `${unsafeLinks} external links opening in new tabs lack protection.`,
      recommendation: "Add rel='noopener noreferrer' to links that open in a new tab.",
    });
  }

  // Security headers
  const metaCsp = $("meta[http-equiv='content-security-policy' i]").length > 0;
  const hasCsp = csp || metaCsp;
  const securityHeaderCount = [hsts, hasCsp, xFrame].filter(Boolean).length;
  if (securityHeaderCount >= 2) {
    structureItems.push({
      id: "security-headers",
      title: "Browser security rules",
      verdict: "good",
      summary: "Multiple browser security rules are active.",
    });
  } else if (securityHeaderCount === 1) {
    structureItems.push({
      id: "security-headers",
      title: "Browser security rules",
      verdict: "moderate",
      summary: "Basic security headers are present.",
      recommendation: "Enable Strict Transport Security and Content Security Policy headers.",
    });
  } else {
    structureItems.push({
      id: "security-headers",
      title: "Browser security rules",
      verdict: "moderate",
      summary: "Standard security protection headers were not found.",
      recommendation: "Add protective HTTP headers on your server.",
    });
  }

  // Helper to compute category score
  const calculateScore = (items: AuditItem[]): number => {
    if (!items.length) return 100;
    const totalPoints = items.reduce((sum, it) => {
      if (it.verdict === "good") return sum + 100;
      if (it.verdict === "moderate") return sum + 65;
      return sum + 20;
    }, 0);
    return Math.round(totalPoints / items.length);
  };

  const categories: AuditCategory[] = [
    {
      key: "speed",
      name: "Speed",
      score: calculateScore(speedItems),
      description: "How quickly pages respond and load for visitors",
      items: speedItems,
    },
    {
      key: "search",
      name: "Search visibility",
      score: calculateScore(searchItems),
      description: "How clearly search engines read your content",
      items: searchItems,
    },
    {
      key: "access",
      name: "Ease of access",
      score: calculateScore(accessItems),
      description: "How comfortably everyone can read and navigate",
      items: accessItems,
    },
    {
      key: "structure",
      name: "Safety and structure",
      score: calculateScore(structureItems),
      description: "How cleanly your page is built and protected",
      items: structureItems,
    },
  ];

  const overallScore = Math.round(
    categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
  );

  return {
    url: targetUrl,
    finalUrl,
    testedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    overallScore,
    totalTimeMs: totalDownloadTimeMs,
    pageSizeKb,
    categories,
  };
}

import { test, expect, type Page, type ConsoleMessage, type Request } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Mobile UI/UX sweep for the storefront.
// One test per route, mobile viewport (iPhone 12, 390x844).
// Per route we capture: console errors, page errors, failed requests,
// horizontal overflow, tap targets smaller than 44x44, images missing alt,
// and a full-page PNG. Findings are flushed to
// mobile-audit-output/report.json in afterAll.

const OUT_DIR = "mobile-audit-output";
mkdirSync(OUT_DIR, { recursive: true });

const MOBILE_VIEWPORT = { width: 390, height: 844 };

type SmallTargetSample = { text: string; w: number; h: number; tag: string };

type Probe = {
  title: string;
  scrollWidth: number;
  innerWidth: number;
  innerHeight: number;
  missingAlt: number;
  smallTargets: number;
  smallTargetSamples: SmallTargetSample[];
  stickyBlockers: number;
  probeError?: string;
};

type Finding = {
  path: string;
  status: "ok" | "error";
  finalUrl: string;
  title: string;
  overflowing: boolean;
  scrollWidth: number;
  innerWidth: number;
  missingAlt: number;
  smallTargets: number;
  smallTargetSamples: SmallTargetSample[];
  stickyBlockers: number;
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  serverErrorResponses: string[];
  gotoError?: string;
};

const findings: Finding[] = [];

function slugFor(path: string): string {
  if (path === "/") return "home";
  return path.replace(/^\//, "").replace(/\//g, "_");
}

async function auditRoute(page: Page, path: string): Promise<Finding> {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const serverErrorResponses: string[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text().slice(0, 500));
    }
  };
  const onPageError = (err: Error) => {
    pageErrors.push(err.message.slice(0, 500));
  };
  const onRequestFailed = (req: Request) => {
    const url = req.url();
    // Skip HMR / dev-only noise
    if (url.includes("/_next/webpack-hmr") || url.includes("/_next/static/chunks/pages")) {
      return;
    }
    failedRequests.push(`${req.method()} ${url} — ${req.failure()?.errorText ?? "unknown"}`);
  };
  const onResponse = async (res: {
    status: () => number;
    url: () => string;
    request: () => { method: () => string };
  }) => {
    const status = res.status();
    if (status >= 500) {
      serverErrorResponses.push(`${res.request().method()} ${res.url()} — ${status}`);
    }
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  let gotoError: string | undefined;
  try {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 20_000 });
    // Best-effort settle — many Next.js dev routes never hit networkidle because
    // of HMR websockets and prefetches, so we don't hard-fail on the timeout.
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  } catch (e) {
    gotoError = e instanceof Error ? e.message : String(e);
  }

  // Let lazy content / fonts settle
  await page.waitForTimeout(600);

  const probe: Probe = await page
    .evaluate(() => {
      const innerWidth = window.innerWidth;
      const innerHeight = window.innerHeight;
      const scrollWidth = document.documentElement.scrollWidth;
      const title = document.title;

      const imgs = Array.from(document.querySelectorAll("img"));
      const missingAlt = imgs.filter((img) => {
        const alt = img.getAttribute("alt");
        return alt === null || alt.trim() === "";
      }).length;

      // Interactive element sizing (WCAG 2.2 target size: 24px minimum, 44px preferred / Apple HIG)
      const interactive = Array.from(
        document.querySelectorAll<HTMLElement>(
          'button, a[href], [role="button"], input:not([type="hidden"]), select, textarea, [role="link"], [role="tab"], [role="menuitem"], [role="switch"], [role="checkbox"], [role="radio"]',
        ),
      );
      const smallTargetSamples: Array<{ text: string; w: number; h: number; tag: string }> = [];
      let smallTargets = 0;
      for (const el of interactive) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const style = window.getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        // Skip off-viewport (offscreen nav items, etc.)
        if (r.bottom < 0 || r.top > document.documentElement.scrollHeight) continue;
        if (r.width < 44 || r.height < 44) {
          smallTargets++;
          if (smallTargetSamples.length < 8) {
            const text = (
              el.textContent?.trim() ||
              el.getAttribute("aria-label") ||
              el.getAttribute("title") ||
              el.tagName
            )
              .toString()
              .slice(0, 50);
            smallTargetSamples.push({
              text,
              w: Math.round(r.width),
              h: Math.round(r.height),
              tag: el.tagName.toLowerCase(),
            });
          }
        }
      }

      // Sticky / fixed elements covering >30% viewport (likely stuck drawers / modals)
      let stickyBlockers = 0;
      const all = document.querySelectorAll<HTMLElement>("body *");
      for (const el of all) {
        const style = window.getComputedStyle(el);
        if (style.position !== "fixed" && style.position !== "sticky") continue;
        if (style.visibility === "hidden" || style.display === "none") continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const coverage = (r.width * r.height) / (innerWidth * innerHeight);
        if (coverage > 0.3) stickyBlockers++;
      }

      return {
        title,
        scrollWidth,
        innerWidth,
        innerHeight,
        missingAlt,
        smallTargets,
        smallTargetSamples,
        stickyBlockers,
      };
    })
    .catch((e: unknown) => ({
      title: "",
      scrollWidth: 0,
      innerWidth: 0,
      innerHeight: 0,
      missingAlt: 0,
      smallTargets: 0,
      smallTargetSamples: [],
      stickyBlockers: 0,
      probeError: e instanceof Error ? e.message : String(e),
    }));

  const slug = slugFor(path);
  try {
    await page.screenshot({ path: join(OUT_DIR, `${slug}.png`), fullPage: true });
  } catch (e) {
    pageErrors.push(`screenshot: ${e instanceof Error ? e.message : String(e)}`);
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  page.off("response", onResponse);

  const finding: Finding = {
    path,
    status: gotoError ? "error" : "ok",
    finalUrl: page.url(),
    title: probe.title,
    overflowing: probe.scrollWidth > probe.innerWidth + 1,
    scrollWidth: probe.scrollWidth,
    innerWidth: probe.innerWidth,
    missingAlt: probe.missingAlt,
    smallTargets: probe.smallTargets,
    smallTargetSamples: probe.smallTargetSamples,
    stickyBlockers: probe.stickyBlockers,
    consoleErrors,
    pageErrors,
    failedRequests,
    serverErrorResponses,
    gotoError,
  };

  findings.push(finding);
  return finding;
}

// =============================================================================
// Public sweep
// =============================================================================

test.describe("mobile audit — public routes", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  const publicRoutes = [
    "/",
    "/about",
    "/categories",
    "/categories/watches",
    "/categories/menswear",
    "/categories/womenswear",
    "/products",
    "/products/skmei-2307-digital-sports-watch-silver-steel",
    "/search",
    "/flash-sales",
    "/faq",
    "/contact",
    "/docs",
    "/shipping",
    "/returns-policy",
    "/terms",
    "/privacy",
    "/auth/login",
    "/auth/register",
  ];

  for (const path of publicRoutes) {
    test(`public ${path}`, async ({ page }) => {
      const finding = await auditRoute(page, path);
      expect(finding.gotoError, `goto(${path}) failed: ${finding.gotoError}`).toBeUndefined();
    });
  }
});

// =============================================================================
// Auth-gated sweep
// =============================================================================

test.describe("mobile audit — auth routes", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "olxnncgepmnlrhfbuk@nespj.com";
  const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

  // React 19 controlled inputs require pressSequentially — see auth.spec.ts.
  async function fillInput(page: Page, selector: string, value: string) {
    const loc = page.locator(selector);
    await loc.click();
    await loc.selectText();
    await loc.pressSequentially(value, { delay: 20 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await fillInput(page, "#login-email", EMAIL);
    await fillInput(page, "#login-password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/account/, { timeout: 20_000 });
  });

  const authRoutes = [
    "/account",
    "/account/profile",
    "/account/orders",
    "/account/addresses",
    "/account/wishlist",
    "/account/loyalty",
    "/account/returns",
    "/account/support",
  ];

  for (const path of authRoutes) {
    test(`auth ${path}`, async ({ page }) => {
      const finding = await auditRoute(page, path);
      expect(finding.gotoError, `goto(${path}) failed: ${finding.gotoError}`).toBeUndefined();
    });
  }
});

// =============================================================================
// Report flush
// =============================================================================

test.afterAll(async () => {
  // Sort by path for stable diffs
  findings.sort((a, b) => a.path.localeCompare(b.path));
  writeFileSync(
    join(OUT_DIR, "report.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        viewport: MOBILE_VIEWPORT,
        totalRoutes: findings.length,
        findings,
      },
      null,
      2,
    ),
  );
});

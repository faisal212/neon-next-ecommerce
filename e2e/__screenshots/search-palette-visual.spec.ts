import { test } from "@playwright/test";

// Throwaway screenshot capture for visual verification of the search palette.
// Not a real test — no assertions. Delete this file after the user has
// approved the visuals.

test.describe.configure({ mode: "serial" });

async function typeInto(
  page: import("@playwright/test").Page,
  selector: string,
  value: string,
) {
  const loc = page.locator(selector);
  await loc.click();
  await loc.pressSequentially(value, { delay: 15 });
}

test("capture: parchment header + full viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/__screenshots/01-parchment-header.png" });
});

test("capture: palette open, empty state (no recent searches yet)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.context().clearCookies();
  await page.addInitScript(() => {
    window.localStorage.removeItem("cover:recent-searches");
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Search products" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "e2e/__screenshots/02-palette-empty.png" });
});

test("capture: palette with results for 'skmei'", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Search products" }).click();
  await typeInto(page, '[role="combobox"]', "skmei");
  // Wait for the actual result rows + their thumbnail images to render.
  await page.getByRole("option").first().waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/__screenshots/03-palette-results.png" });
});

test("capture: second result selected via arrow-down", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Search products" }).click();
  await typeInto(page, '[role="combobox"]', "skmei");
  await page.getByRole("option").first().waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(100);
  await page.screenshot({ path: "e2e/__screenshots/04-palette-arrow-selected.png" });
});

test("capture: no-results state with fallback link", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Search products" }).click();
  await typeInto(page, '[role="combobox"]', "zzzzxxxyyy");
  // Wait for the no-results fallback button to render — that proves the
  // API call completed and isLoading is false.
  await page
    .getByRole("button", { name: /Search all products/ })
    .waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/__screenshots/05-palette-no-results.png" });
});

test("capture: mobile viewport — palette full-bleed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Search products" }).click();
  await typeInto(page, '[role="combobox"]', "skmei");
  await page.getByRole("option").first().waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "e2e/__screenshots/06-palette-mobile.png" });
});

test("capture: mobile hamburger — parchment Sheet", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "e2e/__screenshots/07-mobile-hamburger.png" });
});

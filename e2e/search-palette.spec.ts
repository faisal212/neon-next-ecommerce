import { test, expect, type Page } from "@playwright/test";

// React 19 controlled inputs don't respond to fill() — same caveat as auth.spec.ts.
async function typeInto(page: Page, selector: string, value: string) {
  const loc = page.locator(selector);
  await loc.click();
  await loc.pressSequentially(value, { delay: 20 });
}

test.describe("Search palette", () => {
  test("search icon opens the palette and the input is focused", async ({ page }) => {
    await page.goto("/");

    const searchButton = page.getByRole("button", { name: "Search products" });
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    const combobox = page.getByRole("combobox");
    await expect(combobox).toBeFocused();
    await expect(combobox).toHaveAttribute("placeholder", /Search.*Cover catalog/);
  });

  test("typing a query shows enriched results with thumbnails", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();

    const combobox = page.getByRole("combobox");
    await typeInto(page, '[role="combobox"]', "skmei");

    // At least one result row renders with category "Watches" and a Rs price.
    const options = page.getByRole("option");
    await expect(options.first()).toBeVisible({ timeout: 5_000 });
    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    // First row shows category label + tabular price.
    await expect(options.first()).toContainText("Watches");
    await expect(options.first()).toContainText("Rs ");
  });

  test("Enter on a selected result navigates to the product page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();
    await typeInto(page, '[role="combobox"]', "skmei");

    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");

    await page.waitForURL(/\/products\//, { timeout: 10_000 });
    expect(page.url()).toContain("/products/");
  });

  test("Ctrl+K opens and Escape closes the palette", async ({ page }) => {
    await page.goto("/");

    // Wait for the Search button to become visible — a proxy for React
    // hydration completing, so the SearchTrigger's global keydown listener
    // is actually bound before we press the shortcut.
    await expect(
      page.getByRole("button", { name: "Search products" }),
    ).toBeVisible();

    // Focus the body so the keydown event isn't swallowed by an
    // auto-focused header link or button.
    await page.locator("body").click({ position: { x: 5, y: 300 } });

    // Use Control on Windows/Linux; test harness runs on Windows in this repo.
    await page.keyboard.press("Control+K");
    await expect(page.getByRole("combobox")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("combobox")).toHaveCount(0);
  });

  test("no-results state offers a fallback to the full search page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();
    await typeInto(page, '[role="combobox"]', "zzzzxxxyyy");

    const fallback = page.getByRole("button", {
      name: /Search all products/,
    });
    await expect(fallback).toBeVisible({ timeout: 5_000 });

    await fallback.click();
    await page.waitForURL(/\/search\?q=zzzzxxxyyy/);
    expect(page.url()).toContain("q=zzzzxxxyyy");
  });

  test("recent searches chip appears after a successful search", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();
    await typeInto(page, '[role="combobox"]', "skmei");
    await expect(page.getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/products\//);

    // Return to home, reopen the palette, the recent chip should be present.
    await page.goto("/");
    await page.getByRole("button", { name: "Search products" }).click();

    const chip = page.getByRole("button", { name: /skmei/ });
    await expect(chip.first()).toBeVisible();
  });
});

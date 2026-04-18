import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_ADMIN_EMAIL ?? "olxnncgepmnlrhfbuk@nespj.com";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD!;
const WRONG_PASSWORD = "WrongPassword@999";

// React 19 controlled inputs don't respond to fill() — the native value change
// fires but React's synthetic onChange never sees it, so state stays empty.
// pressSequentially() types character-by-character and triggers the events
// React actually listens to.
async function fillInput(
  page: import("@playwright/test").Page,
  selector: string,
  value: string
) {
  const loc = page.locator(selector);
  await loc.click();
  await loc.selectText();
  await loc.pressSequentially(value, { delay: 20 });
}

async function login(page: import("@playwright/test").Page) {
  await page.goto("/auth/login");
  await fillInput(page, "#login-email", EMAIL);
  await fillInput(page, "#login-password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/account/, { timeout: 20_000 });
}

async function logout(page: import("@playwright/test").Page) {
  await page.click('button:has-text("Sign out")');
  await page.waitForURL("/", { timeout: 15_000 });
}

// More specific than getByRole('alert') which also matches Next.js route announcer
const errorBanner = (page: import("@playwright/test").Page) =>
  page.locator('[role="alert"]:not([id="__next-route-announcer__"])');

test.describe("Auth flow", () => {
  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/auth/login");
    await fillInput(page, "#login-email", EMAIL);
    await fillInput(page, "#login-password", WRONG_PASSWORD);
    await page.click('button[type="submit"]');

    const banner = errorBanner(page);
    await expect(banner).toBeVisible({ timeout: 10_000 });
    await expect(banner).not.toBeEmpty();
  });

  test("login with valid credentials redirects to /account", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/account/);
    await expect(errorBanner(page)).not.toBeVisible();
  });

  test("login → logout → login succeeds on first attempt (3 cycles)", async ({ page }) => {
    for (let cycle = 1; cycle <= 3; cycle++) {
      await page.goto("/auth/login");
      await fillInput(page, "#login-email", EMAIL);
      await fillInput(page, "#login-password", PASSWORD);
      await page.click('button[type="submit"]');

      // Must land on /account without an error banner on the FIRST attempt —
      // this is the regression check. Before the window.location.replace() fix
      // the old session cookie was left in a transitional state and the signIn
      // call would fail on the first 1-2 tries after each logout.
      await page.waitForURL(/\/account/, { timeout: 20_000 });
      await expect(
        errorBanner(page),
        `Cycle ${cycle}: login showed an error banner`
      ).not.toBeVisible();

      await logout(page);
    }
  });
});

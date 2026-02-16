import { expect, test, type Page } from "@playwright/test";

const INTERNAL_TEST_EMAIL =
  process.env.INTERNAL_TEST_EMAIL || "divithselvam23@gmail.com";
const INTERNAL_TEST_PASSWORD =
  process.env.INTERNAL_TEST_PASSWORD || "Ninja@2005";

async function loginAsInternalUser(page: Page) {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

  await page.locator("#email").fill(INTERNAL_TEST_EMAIL);
  await page.locator("#password").fill(INTERNAL_TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForURL(/\/dashboard$/, { timeout: 20_000 });
}

test("redirects unauthenticated user to login", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("internal user can log in and open dashboard", async ({ page }) => {
  await loginAsInternalUser(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Overview")).toBeVisible();
});

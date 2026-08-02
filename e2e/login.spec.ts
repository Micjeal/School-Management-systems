import { expect, test } from "@playwright/test";

test("login page is accessible", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("protected application redirects anonymous users", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/login/);
});

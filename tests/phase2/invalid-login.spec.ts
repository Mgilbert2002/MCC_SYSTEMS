import { test, expect } from '@playwright/test';

test('rejects invalid login credentials', async ({ page }) => {
  await page.goto('/');

  const inputs = page.locator('input');

  // Login email
  await inputs.nth(6).fill('wrong.user@mcc.rw');

  // Wrong password
  await inputs.nth(7).fill('WrongPassword123');

  await page.getByRole('button', { name: /Login/i }).last().click();

  // User should remain on login/home page
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 });

  // Page should still contain login form
  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();
});
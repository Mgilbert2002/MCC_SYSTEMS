import { test, expect } from '@playwright/test';

test('operator session persists after page reload', async ({ page }) => {
  const timestamp = Date.now();

  const email = `session.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  await page.goto('/');

  const inputs = page.locator('input');

  // Register operator
  await inputs.nth(0).fill(`Session Test ${timestamp}`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(email);
  await inputs.nth(4).fill(password);
  await inputs.nth(5).fill(password);

  await page.getByRole('button', { name: /Register/i }).click();

  await expect(
    page.getByText('Registration successful! Please login.')
  ).toBeVisible({ timeout: 10000 });

  // Login
  await inputs.nth(6).fill(email);
  await inputs.nth(7).fill(password);

  await page.getByRole('button', { name: /Login/i }).last().click();

  await page.waitForURL(/\/operator$/, {
    timeout: 10000
  });

  // Confirm authenticated dashboard
  await expect(
    page.getByRole('heading', { name: /Welcome back/i })
  ).toBeVisible({ timeout: 10000 });

  // Reload the browser
  await page.reload();

  // Session should still be active
  await expect(page).toHaveURL(/\/operator$/, {
    timeout: 10000
  });

  await expect(
    page.getByRole('heading', { name: /Welcome back/i })
  ).toBeVisible({ timeout: 10000 });
});
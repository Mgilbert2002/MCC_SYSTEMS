import { test, expect } from '@playwright/test';

test('operator cannot access manager pages', async ({ page }) => {
  const timestamp = Date.now();

  const email = `role.test.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  await page.goto('/');

  const inputs = page.locator('input');

  // Register operator
  await inputs.nth(0).fill(`Role Test Operator ${timestamp}`);
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

  // Try manager dashboard
  await page.goto('/manager');

  await page.waitForTimeout(500);

  // Operator must not remain on the manager route
  await expect(page).not.toHaveURL(/\/manager$/);

  // Try another manager-only page
  await page.goto('/manager/products');

  await page.waitForTimeout(500);

  await expect(page).not.toHaveURL(/\/manager\/products$/);
});
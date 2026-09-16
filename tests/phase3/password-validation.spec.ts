import { test, expect } from '@playwright/test';

test('rejects password shorter than 6 characters', async ({ page }) => {
  const timestamp = Date.now();

  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(`Weak Password ${timestamp}`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(`weak.${timestamp}@mcc.rw`);
  await inputs.nth(4).fill('123');
  await inputs.nth(5).fill('123');

  await page.getByRole('button', { name: /Register/i }).click();

  await page.waitForTimeout(1000);

  await expect(
  page.getByText('Password must be at least 6 characters')
).toBeVisible();
});
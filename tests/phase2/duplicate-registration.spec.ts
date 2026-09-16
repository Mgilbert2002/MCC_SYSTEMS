import { test, expect } from '@playwright/test';

test('rejects duplicate registration email', async ({ page }) => {
  const timestamp = Date.now();

  const email = `duplicate.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  await page.goto('/');

  const inputs = page.locator('input');

  // First registration
  await inputs.nth(0).fill(`Duplicate User ${timestamp}`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(email);
  await inputs.nth(4).fill(password);
  await inputs.nth(5).fill(password);

  await page.getByRole('button', { name: /Register/i }).click();

  await expect(
    page.getByText('Registration successful! Please login.')
  ).toBeVisible({ timeout: 10000 });

  // Try registering the SAME email again
  await inputs.nth(0).fill(`Duplicate User Again ${timestamp}`);
  await inputs.nth(1).fill(`079${String(timestamp).slice(-7)}`);

  await inputs.nth(3).fill(email);
  await inputs.nth(4).fill(password);
  await inputs.nth(5).fill(password);

  await page.getByRole('button', { name: /Register/i }).click();

  // Wait for server response
  await page.waitForTimeout(1500);

  // Registration should NOT succeed a second time
  await expect(
    page.getByText('Registration successful! Please login.')
  ).not.toBeVisible();
});
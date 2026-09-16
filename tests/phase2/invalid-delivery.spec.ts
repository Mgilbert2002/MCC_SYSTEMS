import { test, expect } from '@playwright/test';

test('rejects invalid milk delivery quantity', async ({ page }) => {
  const timestamp = Date.now();

  const email = `invalid.delivery.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  // Register
  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(`Invalid Delivery ${timestamp}`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(email);
  await inputs.nth(4).fill(password);
  await inputs.nth(5).fill(password);

  await page.getByRole('button', { name: /Register/i }).click();

  await expect(
    page.getByText('Registration successful! Please login.')
  ).toBeVisible();

  // Login
  await inputs.nth(6).fill(email);
  await inputs.nth(7).fill(password);

  await page.getByRole('button', { name: /Login/i }).last().click();

  await page.waitForURL(/\/operator$/, { timeout: 10000 });

  // New delivery
  await page.goto('/operator/delivery/new');

  const deliveryInputs = page.locator('input');

  await deliveryInputs.nth(0).fill('FARM2');
  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(`Invalid Delivery ${timestamp}`);

  // INVALID quantity
  await deliveryInputs.nth(4).fill('0');

  // Unit price
  await deliveryInputs.nth(5).fill('350');

  // The form should not successfully record an invalid delivery
  const recordButton = page.getByRole('button', {
    name: 'Record Delivery'
  });

  await recordButton.click();

  await page.waitForTimeout(1500);

  // We should NOT see successful save
  await expect(
    page.getByText(/Delivery recorded successfully!/i)
  ).not.toBeVisible();
});
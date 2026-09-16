import { test, expect } from '@playwright/test';

test('rejects negative milk quantity', async ({ page }) => {
  const timestamp = Date.now();

  const email = `negative.qty.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  await page.goto('/');

  const inputs = page.locator('input');

  // Register operator
  await inputs.nth(0).fill(`Negative Quantity ${timestamp}`);
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

  // Open delivery page
  await page.goto('/operator/delivery/new');

  await expect(
    page.getByRole('heading', { name: 'New Milk Delivery' })
  ).toBeVisible({ timeout: 10000 });

  const deliveryInputs = page.locator('input');

  await deliveryInputs.nth(0).fill('FARM2');

  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(`Negative Quantity ${timestamp}`);

  // Invalid quantity
  await deliveryInputs.nth(4).fill('-50');

  await deliveryInputs.nth(5).fill('350');

  await page.getByRole('button', { name: 'Record Delivery' }).click();

  await page.waitForTimeout(1500);

  // Delivery must not be successfully recorded
  await expect(
    page.getByText(/Delivery recorded successfully!/i)
  ).not.toBeVisible();
});
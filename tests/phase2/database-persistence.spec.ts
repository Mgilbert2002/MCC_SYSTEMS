import { test, expect } from '@playwright/test';

test('milk delivery persists after leaving and reopening the report', async ({ page }) => {
  const timestamp = Date.now();

  const email = `persistence.${timestamp}@mcc.rw`;
  const password = 'Test@1234';
  const quantity = '75';

  // Register operator
  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(`Persistence User ${timestamp}`);
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

  // Open milk delivery page
  await page.goto('/operator/delivery/new');

  await expect(
    page.getByRole('heading', { name: 'New Milk Delivery' })
  ).toBeVisible({ timeout: 10000 });

  const deliveryInputs = page.locator('input');

  await deliveryInputs.nth(0).fill('FARM2');
  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(`Persistence Delivery ${timestamp}`);
  await deliveryInputs.nth(4).fill(quantity);
  await deliveryInputs.nth(5).fill('350');

  await page.locator('textarea').fill(
    `Persistence test ${timestamp}`
  );

  // Verify calculated amount
  await expect(
    page.getByText('26,250 RWF')
  ).toBeVisible();

  // Save delivery
  await page.getByRole('button', { name: 'Record Delivery' }).click();

  await expect(
    page.getByText(/Delivery recorded successfully!/i)
  ).toBeVisible({ timeout: 10000 });

  // Wait for redirect
  await page.waitForURL(/\/operator\/quality/, {
    timeout: 10000
  });

  // Leave the page
  await page.goto('/operator');

  await expect(
    page.getByRole('heading', { name: /Welcome back/i })
  ).toBeVisible({ timeout: 10000 });

  // Reopen delivery reports
  await page.goto('/operator/deliveries');

  await expect(
    page.getByRole('heading', { name: 'Delivery Reports' })
  ).toBeVisible({ timeout: 10000 });

  // Verify saved delivery is still present
  await expect(
    page.getByText('75.00')
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('accepted')
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('unpaid')
  ).toBeVisible({ timeout: 10000 });
});
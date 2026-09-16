import { test, expect } from '@playwright/test';

test('production build complete MCC flow', async ({ page }) => {
  const timestamp = Date.now();

  const name = `Production User ${timestamp}`;
  const email = `production.${timestamp}@mcc.rw`;
  const phone = `078${String(timestamp).slice(-7)}`;
  const password = 'Test@1234';

  await page.goto('http://localhost:4173/');

  const inputs = page.locator('input');

  // Register
  await inputs.nth(0).fill(name);
  await inputs.nth(1).fill(phone);

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

  await expect(
    page.getByRole('heading', { name: /Welcome back/i })
  ).toBeVisible({ timeout: 10000 });

  // Milk collection
  await page.goto('http://localhost:4173/operator/delivery/new');

  await expect(
    page.getByRole('heading', { name: 'New Milk Delivery' })
  ).toBeVisible({ timeout: 10000 });

  const deliveryInputs = page.locator('input');

  await deliveryInputs.nth(0).fill('FARM2');
  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(`Production Delivery ${timestamp}`);
  await deliveryInputs.nth(4).fill('50');
  await deliveryInputs.nth(5).fill('350');

  await page.locator('textarea').fill(
    `Production test ${timestamp}`
  );

  await expect(
    page.getByText('17,500 RWF')
  ).toBeVisible();

  await page.getByRole('button', {
    name: 'Record Delivery'
  }).click();

  await expect(
    page.getByText(/Delivery recorded successfully!/i)
  ).toBeVisible({ timeout: 10000 });

  await page.waitForURL(/\/operator\/quality/, {
    timeout: 10000
  });

  // Report
  await page.goto('http://localhost:4173/operator/deliveries');

  await expect(
    page.getByRole('heading', { name: 'Delivery Reports' })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('50.00')
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('accepted')
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('unpaid')
  ).toBeVisible({ timeout: 10000 });
});
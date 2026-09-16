import { test, expect } from '@playwright/test';

test('operator can logout successfully', async ({ page }) => {
  const timestamp = Date.now();

  const email = `logout.${timestamp}@mcc.rw`;
  const password = 'Test@1234';

  // 1. Register
  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(`Logout User ${timestamp}`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(email);
  await inputs.nth(4).fill(password);
  await inputs.nth(5).fill(password);

  await page.getByRole('button', { name: /Register/i }).click();

  await expect(
    page.getByText('Registration successful! Please login.')
  ).toBeVisible({ timeout: 10000 });

  // 2. Login
  await inputs.nth(6).fill(email);
  await inputs.nth(7).fill(password);

  await page.getByRole('button', { name: /Login/i }).last().click();

  await page.waitForURL(/\/operator$/, {
    timeout: 10000
  });

  // 3. Logout
await page.getByText('Logout', { exact: true }).last().click();

  // 4. Verify redirect to login/home
  await expect(page).toHaveURL(/\/$/, {
    timeout: 10000
  });

  // 5. Verify Login page is visible
  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible({ timeout: 10000 });
});
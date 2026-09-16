import { test, expect } from '@playwright/test';

test('production preview loads successfully', async ({ page }) => {
  await page.goto('http://localhost:4173/');

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Register' })
  ).toBeVisible({ timeout: 10000 });
});
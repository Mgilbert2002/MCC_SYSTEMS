import { test, expect } from '@playwright/test';

test('unauthenticated user cannot access operator pages', async ({ page }) => {
  // Try to access the new milk delivery page without logging in
  await page.goto('/operator/delivery/new');

  await expect(page).toHaveURL(/\/$/, {
    timeout: 10000
  });

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();

  // Try to access delivery reports without logging in
  await page.goto('/operator/deliveries');

  await expect(page).toHaveURL(/\/$/, {
    timeout: 10000
  });

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();
});
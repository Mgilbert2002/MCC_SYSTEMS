import { test, expect } from '@playwright/test';

test('application is usable on mobile and desktop screen sizes', async ({ page }) => {

  // Mobile
  await page.setViewportSize({
    width: 390,
    height: 844
  });

  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Register' })
  ).toBeVisible();

  // Tablet
  await page.setViewportSize({
    width: 768,
    height: 1024
  });

  await page.reload();

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Register' })
  ).toBeVisible();

  // Desktop
  await page.setViewportSize({
    width: 1366,
    height: 768
  });

  await page.reload();

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Register' })
  ).toBeVisible();
});
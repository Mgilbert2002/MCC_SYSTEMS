import { test, expect } from '@playwright/test';

test('SQL injection attempt does not bypass login', async ({ page }) => {
  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(6).fill("' OR '1'='1");
  await inputs.nth(7).fill("' OR '1'='1");

  await page.getByRole('button', { name: /Login/i }).last().click();

  await page.waitForTimeout(1000);

  await expect(page).toHaveURL(/\/$/);

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();
});
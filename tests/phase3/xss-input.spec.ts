import { test, expect } from '@playwright/test';

test('XSS input is not executed', async ({ page }) => {
  const timestamp = Date.now();

  let dialogTriggered = false;

  page.on('dialog', async dialog => {
    dialogTriggered = true;
    await dialog.dismiss();
  });

  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(`<script>alert('XSS')</script>`);
  await inputs.nth(1).fill(`078${String(timestamp).slice(-7)}`);

  await page.locator('select').nth(0).selectOption('operator');

  await inputs.nth(3).fill(`xss.${timestamp}@mcc.rw`);
  await inputs.nth(4).fill('Test@1234');
  await inputs.nth(5).fill('Test@1234');

  await page.getByRole('button', { name: /Register/i }).click();

  await page.waitForTimeout(1000);

  expect(dialogTriggered).toBe(false);
});
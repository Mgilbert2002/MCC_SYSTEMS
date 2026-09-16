import { test, expect } from '@playwright/test';

test('MCC complete flow: register → login → dashboard → milk collection → save → report', async ({ page }) => {
  const timestamp = Date.now();

  const operatorName = `E2E Operator ${timestamp}`;
  const operatorEmail = `e2e.operator.${timestamp}@mcc.rw`;
  const operatorPhone = `078${String(timestamp).slice(-7)}`;
  const operatorPassword = 'Test@1234';

  const deliveryPerson = `E2E Delivery ${timestamp}`;

  // ============================================================
  // 1. OPEN MCC HOME PAGE
  // ============================================================

  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Register' })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible({ timeout: 10000 });

  // ============================================================
  // 2. REGISTER OPERATOR
  // ============================================================

  const homeInputs = page.locator('input');

  // Confirmed from homepage inspection:
  // 0 = Full Name
  // 1 = Phone
  // 2 = Profile Image
  // 3 = Register Email
  // 4 = Register Password
  // 5 = Confirm Password
  // 6 = Login Email
  // 7 = Login Password
  // 8 = Remember Me

  await homeInputs.nth(0).fill(operatorName);
  await homeInputs.nth(1).fill(operatorPhone);

  await page.locator('select').nth(0).selectOption('operator');

  await homeInputs.nth(3).fill(operatorEmail);
  await homeInputs.nth(4).fill(operatorPassword);
  await homeInputs.nth(5).fill(operatorPassword);

  await page.getByRole('button', { name: /Register/i }).click();

  await expect(
    page.getByText('Registration successful! Please login.')
  ).toBeVisible({ timeout: 10000 });

  // ============================================================
  // 3. LOGIN
  // ============================================================

  await homeInputs.nth(6).fill(operatorEmail);
  await homeInputs.nth(7).fill(operatorPassword);

  await page.getByRole('button', { name: /Login/i }).last().click();

  // ============================================================
  // 4. VERIFY OPERATOR DASHBOARD
  // ============================================================

  await expect(page).toHaveURL(/\/operator$/, {
    timeout: 10000,
  });

  // ============================================================
  // 5. OPEN MILK COLLECTION
  // ============================================================

  await page.goto('/operator/delivery/new');

  await expect(
    page.getByRole('heading', { name: 'New Milk Delivery' })
  ).toBeVisible({ timeout: 10000 });

  // ============================================================
  // 6. ENTER MILK COLLECTION DATA
  // ============================================================

  const deliveryInputs = page.locator('input');

  // Confirmed from delivery-page inspection:
  // 0 = Farmer Code
  // 1 = Farmer Name
  // 2 = Farmer ID
  // 3 = Delivery Person
  // 4 = Quantity KG
  // 5 = Unit Price
  // 6 = Date
  // 7 = Time

  await deliveryInputs.nth(0).fill('FARM2');

  // Give the farmer lookup API time to respond
  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(deliveryPerson);

  await deliveryInputs.nth(4).fill('50');
  await deliveryInputs.nth(5).fill('350');

  await page
    .locator('textarea')
    .fill(`Automated Playwright E2E test delivery ${timestamp}`);

  // ============================================================
  // 7. VERIFY CALCULATED TOTAL
  // ============================================================

  // 50 KG × 350 RWF = 17,500 RWF
  await expect(
    page.getByText('17,500 RWF')
  ).toBeVisible();

  // ============================================================
  // 8. SAVE MILK COLLECTION
  // ============================================================

  await page.getByRole('button', {
    name: 'Record Delivery',
  }).click();

  await expect(
    page.getByText(/Delivery recorded successfully!/i)
  ).toBeVisible({ timeout: 10000 });

  // ============================================================
  // 9. VERIFY QUALITY PAGE
  // ============================================================

  await expect(page).toHaveURL(/\/operator\/quality/, {
    timeout: 10000,
  });

  // ============================================================
  // 10. OPEN DELIVERY REPORT
  // ============================================================

  await page.goto('/operator/deliveries');

  await expect(
    page.getByRole('heading', { name: 'Delivery Reports' })
  ).toBeVisible({ timeout: 10000 });

  // ============================================================
  // 11. VERIFY SAVED DELIVERY
  // ============================================================

await expect(page.getByText('50.00')).toBeVisible({ timeout: 10000 });
await expect(page.getByText('accepted')).toBeVisible({ timeout: 10000 });
await expect(page.getByText('unpaid')).toBeVisible({ timeout: 10000 });
});
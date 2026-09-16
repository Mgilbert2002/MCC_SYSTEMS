import { test } from '@playwright/test';

test('inspect Delivery Reports after saving a delivery', async ({ page }) => {
  const timestamp = Date.now();

  const operatorName = `Report Inspect ${timestamp}`;
  const operatorEmail = `report.inspect.${timestamp}@mcc.rw`;
  const operatorPhone = `078${String(timestamp).slice(-7)}`;
  const operatorPassword = 'Test@1234';
  const deliveryPerson = `Report Delivery ${timestamp}`;

  // 1. Register
  await page.goto('/');

  const inputs = page.locator('input');

  await inputs.nth(0).fill(operatorName);
  await inputs.nth(1).fill(operatorPhone);
  await page.locator('select').nth(0).selectOption('operator');
  await inputs.nth(3).fill(operatorEmail);
  await inputs.nth(4).fill(operatorPassword);
  await inputs.nth(5).fill(operatorPassword);

  await page.getByRole('button', { name: /Register/i }).click();

  await page.getByText('Registration successful! Please login.')
    .waitFor({ state: 'visible', timeout: 10000 });

  // 2. Login
  await inputs.nth(6).fill(operatorEmail);
  await inputs.nth(7).fill(operatorPassword);

  await page.getByRole('button', { name: /Login/i }).last().click();

  await page.waitForURL(/\/operator$/, { timeout: 10000 });

  // 3. Open New Delivery
  await page.goto('/operator/delivery/new');

  await page.getByRole('heading', { name: 'New Milk Delivery' })
    .waitFor({ state: 'visible', timeout: 10000 });

  const deliveryInputs = page.locator('input');

  // 0 Farmer Code
  // 1 Farmer Name
  // 2 Farmer ID
  // 3 Delivery Person
  // 4 Quantity
  // 5 Unit Price
  // 6 Date
  // 7 Time

  await deliveryInputs.nth(0).fill('FARM2');

  await page.waitForTimeout(1000);

  await deliveryInputs.nth(1).fill('Test Farmer');
  await deliveryInputs.nth(2).fill('2');
  await deliveryInputs.nth(3).fill(deliveryPerson);
  await deliveryInputs.nth(4).fill('50');
  await deliveryInputs.nth(5).fill('350');

  await page.locator('textarea')
    .fill(`Report inspection delivery ${timestamp}`);

  // Check calculated total
  await page.getByText('17,500 RWF').waitFor({
    state: 'visible',
    timeout: 10000
  });

  // 4. Save delivery
  await page.getByRole('button', { name: 'Record Delivery' }).click();

  await page.getByText(/Delivery recorded successfully!/i).waitFor({
    state: 'visible',
    timeout: 10000
  });

  // 5. Wait for redirect
  await page.waitForURL(/\/operator\/quality/, {
    timeout: 10000
  });

  // 6. Open Delivery Reports
  await page.goto('/operator/deliveries');

  await page.getByRole('heading', { name: 'Delivery Reports' }).waitFor({
    state: 'visible',
    timeout: 10000
  });

  await page.waitForTimeout(2000);

  console.log('\nPAGE URL:', page.url());

  console.log('\n===== HEADINGS =====');

  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();

  for (let i = 0; i < headingCount; i++) {
    console.log(
      `HEADING ${i}:`,
      await headings.nth(i).innerText()
    );
  }

  console.log('\n===== TABLES =====');

  const tables = page.locator('table');
  const tableCount = await tables.count();

  console.log('TABLE COUNT:', tableCount);

  for (let i = 0; i < tableCount; i++) {
    console.log(`\nTABLE ${i}:`);

    const rows = tables.nth(i).locator('tr');
    const rowCount = await rows.count();

    console.log('ROW COUNT:', rowCount);

    for (let r = 0; r < rowCount; r++) {
      console.log(
        `ROW ${r}:`,
        await rows.nth(r).innerText()
      );
    }
  }

  console.log('\n===== VISIBLE PAGE TEXT =====');

  const bodyText = await page.locator('body').innerText();

  console.log(bodyText);

  // Keep the test successful while we inspect the actual report.
  await page.screenshot({
    path: 'test-results/delivery-report.png',
    fullPage: true
  });
});
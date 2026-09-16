import { test, expect } from '@playwright/test';

test('unauthenticated API request is rejected', async ({ request }) => {
  const response = await request.get(
    'http://localhost:5000/api/deliveries'
  );

  expect(response.status()).toBeGreaterThanOrEqual(401);
  expect(response.status()).toBeLessThan(500);
});
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

const vmEmail = process.env.E2E_VM_EMAIL;
const vmPassword = process.env.E2E_VM_PASSWORD;
const riderEmail = process.env.E2E_RIDER_EMAIL;
const riderPassword = process.env.E2E_RIDER_PASSWORD;
const branchId = process.env.E2E_BRANCH_ID;

async function login(page: any, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/auth\/login(\?|$)/);
}

test('vendor assigns rider and rider sees the order', async ({ page }) => {
  if (!vmEmail || !vmPassword || !riderEmail || !riderPassword || !branchId) {
    test.skip(
      true,
      'E2E_VM_EMAIL, E2E_VM_PASSWORD, E2E_RIDER_EMAIL, E2E_RIDER_PASSWORD, and E2E_BRANCH_ID must be set',
    );
  }

  // 1) Login as vendor manager
  await login(page, vmEmail!, vmPassword!);

  // 2) Open branch orders
  await page.goto(`/vendor/branches/${branchId}/orders`);
  await expect(page.getByRole('heading', { name: 'Branch orders' })).toBeVisible();

  const orderCards = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200');
  const count = await orderCards.count();
  if (count === 0) {
    test.skip(true, 'No orders found for this branch. Please create an order first.');
  }

  // 3) Capture order ID
  const firstCard = orderCards.first();
  const orderId = (await firstCard.locator('p').nth(1).innerText()).trim();

  // 4) Search riders by email
  await page.getByPlaceholder('Search by rider email').fill(riderEmail!);
  await page.getByRole('button', { name: /Search riders/i }).click();

  const riderSelect = firstCard.locator('select').nth(1);

  const riderId = await riderSelect
    .locator('option', { hasText: riderEmail! })
    .first()
    .getAttribute('value');

  if (!riderId) {
    test.skip(true, 'Rider not found in search results.');
  }

  // 5) Assign rider on the first order card
  await riderSelect.selectOption(riderId!);
  await firstCard.getByRole('button', { name: 'Assign rider' }).click();
  await expect(page.getByText('Rider assigned.', { exact: false })).toBeVisible();
  await expect(firstCard.getByText(new RegExp(`Rider:\\s*${riderEmail}`, 'i'))).toBeVisible();

  // 6) Login as rider
  await page.goto('/auth/login');
  await login(page, riderEmail!, riderPassword!);

  // 7) Rider sees the order
  await page.goto('/rider/orders');
  await expect(page.getByRole('heading', { name: 'Rider - Orders' })).toBeVisible();
  const riderOrderCard = page.locator('div').filter({ hasText: orderId }).first();
  await expect(riderOrderCard).toBeVisible();
});

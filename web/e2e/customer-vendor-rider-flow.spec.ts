/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;
const vmEmail = process.env.E2E_VM_EMAIL;
const vmPassword = process.env.E2E_VM_PASSWORD;
const riderEmail = process.env.E2E_RIDER_EMAIL;
const riderPassword = process.env.E2E_RIDER_PASSWORD;
const branchId = process.env.E2E_BRANCH_ID;
const menuItemId = process.env.E2E_MENU_ITEM_ID;
const addressId = process.env.E2E_ADDRESS_ID;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

async function login(page: any, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/auth\/login(\?|$)/);
}

async function loginViaApi(request: any, email: string, password: string) {
  const res = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  const token = body?.accessToken;
  expect(token).toBeTruthy();
  return token as string;
}

async function placeOrderAsCustomer(page: any, branchId: string) {
  if (!menuItemId) {
    test.skip(true, 'E2E_MENU_ITEM_ID must be set to create an order.');
  }

  // Create order via API
  const token = await loginViaApi(page.request, customerEmail!, customerPassword!);
  const payload: any = {
    items: [{ itemId: menuItemId!, quantity: 1 }],
    branchId,
  };
  if (addressId) {
    payload.addressId = addressId;
  }

  const res = await page.request.post(`${apiBaseUrl}/orders`, { data: payload, headers: { Authorization: `Bearer ${token}` } });
  expect(res.ok()).toBeTruthy();
  const order = await res.json();
  const orderId = order?.id as string;
  expect(orderId).toBeTruthy();

  // Login UI to view orders
  await login(page, customerEmail!, customerPassword!);
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();

  const card = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200').filter({ hasText: orderId }).first();
  await expect(card).toBeVisible();

  return { orderId };
}

async function assignRiderAsVendor(page: any, orderId: string) {
  await login(page, vmEmail!, vmPassword!);
  await page.goto(`/vendor/branches/${branchId}/orders`);
  await expect(page.getByRole('heading', { name: 'Branch orders' })).toBeVisible();

  // Search rider
  await page.getByPlaceholder('Search by rider email').fill(riderEmail!);
  await page.getByRole('button', { name: /Search riders/i }).click();

  // Find order card
  const orderCard = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200').filter({ hasText: orderId }).first();
  await expect(orderCard).toBeVisible();

  // Select rider and assign
  const riderSelect = orderCard.locator('select').nth(1);
  await riderSelect.selectOption({ label: new RegExp(riderEmail!, 'i') });
  await orderCard.getByRole('button', { name: 'Assign rider' }).click();
  await expect(page.getByText('Rider assigned.', { exact: false })).toBeVisible();
  await expect(orderCard.getByText(new RegExp(`Rider:\\s*${riderEmail}`, 'i'))).toBeVisible();
}

async function riderUpdatesStatus(page: any, orderId: string, status: string) {
  await login(page, riderEmail!, riderPassword!);
  await page.goto('/rider/orders');
  await expect(page.getByRole('heading', { name: 'Rider - Orders' })).toBeVisible();

  const card = page.locator('div').filter({ hasText: orderId }).first();
  await expect(card).toBeVisible();

  const statusSelect = card.locator('select');
  await statusSelect.selectOption(status);
  await expect(page.getByText('Delivery status updated.', { exact: false })).toBeVisible();
}

async function customerSeesFinalStatus(page: any, orderId: string, status: string) {
  await login(page, customerEmail!, customerPassword!);
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();

  const card = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200').filter({ hasText: orderId }).first();
  await expect(card).toBeVisible();
  await expect(card.getByLabel(new RegExp(`Status:.*${status}`, 'i'))).toBeVisible();
}

test('customer places order, vendor assigns rider, rider completes delivery, customer sees final status', async ({ page }) => {
  if (
    !customerEmail ||
    !customerPassword ||
    !vmEmail ||
    !vmPassword ||
    !riderEmail ||
    !riderPassword ||
    !branchId
  ) {
    test.skip(
      true,
      'Set E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD, E2E_VM_EMAIL, E2E_VM_PASSWORD, E2E_RIDER_EMAIL, E2E_RIDER_PASSWORD, E2E_BRANCH_ID',
    );
  }

  // Customer places order
  const { orderId } = await placeOrderAsCustomer(page, branchId!);

  // Vendor assigns rider
  await assignRiderAsVendor(page, orderId);

  // Rider marks completed
  await riderUpdatesStatus(page, orderId, 'completed');

  // Customer sees completed status
  await customerSeesFinalStatus(page, orderId, 'Completed');
});

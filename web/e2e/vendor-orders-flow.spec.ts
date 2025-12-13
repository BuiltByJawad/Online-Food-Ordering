/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect } from '@playwright/test';

const baseUrlVmEmail = process.env.E2E_VM_EMAIL;
const baseUrlVmPassword = process.env.E2E_VM_PASSWORD;
const baseUrlCustomerEmail = process.env.E2E_CUSTOMER_EMAIL;
const baseUrlCustomerPassword = process.env.E2E_CUSTOMER_PASSWORD;
const branchId = process.env.E2E_BRANCH_ID;

async function login(page: any, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL(/\/auth\/login(\?|$)/);
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

test.describe('Vendor branch orders and customer My Orders flow', () => {
  test('vendor manager can update order status and customer sees updated status', async ({ page }) => {
    if (!baseUrlVmEmail || !baseUrlVmPassword || !baseUrlCustomerEmail || !baseUrlCustomerPassword || !branchId) {
      test.skip('E2E_VM_EMAIL, E2E_VM_PASSWORD, E2E_CUSTOMER_EMAIL, E2E_CUSTOMER_PASSWORD, and E2E_BRANCH_ID must be set');
    }

    const vmEmail = baseUrlVmEmail!;
    const vmPassword = baseUrlVmPassword!;
    const customerEmail = baseUrlCustomerEmail!;
    const customerPassword = baseUrlCustomerPassword!;

    // 1) Login as vendor manager
    await login(page, vmEmail, vmPassword);

    // 2) Go directly to the branch orders page
    await page.goto(`/vendor/branches/${branchId}/orders`);
    await expect(page.getByRole('heading', { name: 'Branch orders' })).toBeVisible();

    // 3) Ensure there is at least one order card
    const orderCards = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200');
    const count = await orderCards.count();
    if (count === 0) {
      test.skip('No orders found for this branch. Please create an order first.');
    }

    const firstCard = orderCards.first();

    // 4) Read current status and order ID
    const statusSelect = firstCard.locator('select');
    const currentStatus = await statusSelect.inputValue();
    const nextStatus = currentStatus === 'completed' ? 'accepted' : 'completed';

    const orderId = (await firstCard.locator('p').nth(1).innerText()).trim();

    // 5) Update status
    await statusSelect.selectOption(nextStatus);
    await expect(page.getByText('Order status updated.', { exact: false })).toBeVisible();

    const expectedStatusLabel = statusLabel(nextStatus);

    // 6) Log out vendor manager by going to login page
    await page.goto('/auth/login');

    // 7) Login as customer
    await login(page, customerEmail, customerPassword);

    // 8) Go to My Orders page
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();

    // 9) Find the order card by ID and assert the status badge
    const customerOrderCard = page.locator('div').filter({ hasText: orderId }).first();
    await expect(customerOrderCard).toBeVisible();
    await expect(
      customerOrderCard.getByLabel(`Status: ${expectedStatusLabel}`),
    ).toBeVisible();
  });
});

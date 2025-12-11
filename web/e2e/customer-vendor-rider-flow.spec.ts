import { test, expect } from '@playwright/test';

const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;
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

async function placeOrderAsCustomer(page: any, branchId: string) {
  // This assumes the cart already has items for the branch (or a default branch flow).
  // Navigate to checkout directly.
  await page.goto('/checkout');

  // If not logged in, login
  const onLogin = await page
    .getByRole('heading', { name: 'Sign in' })
    .isVisible({ timeout: 500 })
    .catch(() => false);
  if (onLogin) {
    await login(page, customerEmail!, customerPassword!);
    await page.goto('/checkout');
  }

  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

  // If address selection is present, ensure an address is selected (first radio)
  const addressRadio = page.locator('input[type="radio"][name="deliveryAddress"]').first();
  if (await addressRadio.count()) {
    await addressRadio.check();
  }

  // Confirm order
  const confirmBtn = page.getByRole('button', { name: /Confirm order/i });
  await confirmBtn.click();

  // Wait for redirect to /orders or success message
  await page.waitForTimeout(500); // small buffer
  await expect(page).not.toHaveURL(/\/checkout/);

  // Go to My orders
  await page.goto('/orders');
  await expect(page.getByRole('heading', { name: 'My orders' })).toBeVisible();

  // Grab latest order card (first card)
  const firstCard = page.locator('div.space-y-2.rounded-lg.border.border-zinc-200').first();
  await expect(firstCard).toBeVisible();
  const orderId = (await firstCard.locator('p').nth(1).innerText()).trim();
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

import { test, expect } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function loginAsAdmin(page: any) {
  if (!adminEmail || !adminPassword) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set');
  }

  await page.goto('/auth/login');
  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', adminPassword);
  await page.click('button[type="submit"]');
  // Wait until we navigate away from the login page.
  await expect(page).not.toHaveURL(/\/auth\/login(\?|$)/);
}

function randomEmail(prefix: string) {
  const id = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${id}@example.test`;
}

async function registerUser(page: any, email: string, password: string) {
  await page.goto('/auth/register');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // If there are more fields (name/phone), we can skip or fill generic values if present
  await page.click('button[type="submit"]');
  // Wait for redirect away from the register page as a sign of success
  await expect(page).not.toHaveURL(/\/auth\/register(\?|$)/);
}

async function goToAdminUsers(page: any) {
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: /Admin .*Users/ })).toBeVisible();
}

async function goToAdminVendors(page: any) {
  await page.goto('/admin/vendors');
  await expect(page.getByRole('heading', { name: /Admin .*Vendors/ })).toBeVisible();
}

async function promoteToVendorManager(page: any, email: string) {
  await goToAdminUsers(page);

  // Wait for the users table body to be visible
  const tableBody = page.locator('tbody');
  await expect(tableBody).toBeVisible();

  const row = page.locator('tbody tr').filter({ hasText: email });
  await expect(row).toHaveCount(1);

  const select = row.locator('select');
  // Confirm dialog appears; accept it
  page.once('dialog', (dialog: any) => dialog.accept());
  await select.selectOption('vendor_manager');

  // Wait a bit for request to complete
  await page.waitForTimeout(500);
}

async function createVendorForOwner(page: any, ownerEmail: string, vendorName: string) {
  await goToAdminVendors(page);

  // Owner dropdown (first select in the New vendor form)
  const ownerSelect = page.locator('form select').first();
  await expect(ownerSelect).toBeVisible();
  await ownerSelect.selectOption({ label: ownerEmail });

  // Vendor name input
  const vendorNameInput = page.locator('form input[type="text"]').first();
  await vendorNameInput.fill(vendorName);

  await page.getByRole('button', { name: /Create vendor/ }).click();

  await expect(page.getByText('Vendor created.', { exact: false })).toBeVisible();
  await expect(page.getByRole('cell', { name: vendorName })).toBeVisible();
}

const testPassword = 'Password123!';

test.describe('Admin vendor onboarding flow', () => {
  test('admin can promote user to vendor manager and create a vendor for them', async ({ page }) => {
    const vendorManagerEmail = randomEmail('vm');

    // 1) Register a new user to become vendor manager
    await registerUser(page, vendorManagerEmail, testPassword);

    // 2) Log out (if app auto-logs in) by navigating to login page
    await page.goto('/auth/login');

    // 3) Log in as admin
    await loginAsAdmin(page);

    // 4) Promote the new user to vendor_manager in admin users
    await promoteToVendorManager(page, vendorManagerEmail);

    // 5) Create a vendor for that user in admin vendors
    const vendorName = `Test Vendor ${Date.now()}`;
    await createVendorForOwner(page, vendorManagerEmail, vendorName);
  });
});

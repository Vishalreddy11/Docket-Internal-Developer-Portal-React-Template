// Playwright smoke test — the pattern; forkers extend it.
//
// Runs against `pnpm dev` (configured in playwright.config.ts). Because
// VITE_AUTH_MODE defaults to `mock`, no login is required.

import { expect, test } from '@playwright/test';

test('renders items list with MSW-mocked data', async ({ page }) => {
  await page.goto('/');
  // /  redirects to /items via router.tsx.
  await expect(page).toHaveURL(/\/items$/);
  await expect(page.getByRole('heading', { name: /Items/i })).toBeVisible();
  await expect(page.getByText(/First example item/)).toBeVisible();
});

test('creates a new item via the form', async ({ page }) => {
  await page.goto('/items');
  await page.getByLabel('Name').fill('e2e-created');
  await page.getByLabel('Description').fill('via Playwright');
  await page.getByRole('button', { name: /^Create$/ }).click();
  await expect(page.getByText('e2e-created')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('loads graph editor and toolbar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('toolbar')).toBeVisible();
  await expect(page.getByRole('button', { name: /import/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /export/i })).toBeVisible();
});

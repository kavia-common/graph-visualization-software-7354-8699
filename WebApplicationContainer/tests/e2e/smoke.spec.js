import { test, expect } from '@playwright/test';

test('loads graph editor and toolbar', async ({ page }) => {
  await page.goto('/');
  const toolbar = page.getByRole('toolbar');
  await expect(toolbar).toBeVisible();
  await expect(toolbar.getByRole('button', { name: /import/i })).toBeVisible();
  await expect(toolbar.getByRole('button', { name: /export/i })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('loads graph editor and toolbar', async ({ page }) => {
  await page.goto('/');
  const toolbar = page.getByRole('toolbar');
  await expect(toolbar).toBeVisible();
  await expect(page.getByTestId('toolbar-import')).toBeVisible();
  await expect(page.getByTestId('toolbar-export')).toBeVisible();
  await expect(page.getByTestId('toolbar-export-gz')).toBeVisible();
});

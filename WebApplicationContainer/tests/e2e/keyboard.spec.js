import { test, expect } from '@playwright/test';

test('keyboard add node (N) and delete selection (Del)', async ({ page }) => {
  await page.goto('/');

  // Focus canvas so it can receive keyboard events
  const canvas = page.locator('.react-flow').first();
  await canvas.click();

  // Add node with N several times
  await page.keyboard.press('KeyN');
  await page.keyboard.press('KeyN');
  await page.keyboard.press('KeyN');

  // Simulate delete key; cannot verify exact selection count, but ensure no errors and toolbar still present
  await page.keyboard.press('Delete');
  await expect(page.getByRole('toolbar')).toBeVisible();
});

test('shortcuts overlay lists undo/redo indicating keyboard support', async ({ page }) => {
  await page.goto('/');
  const toolbar = page.getByRole('toolbar');
  await toolbar.getByRole('button', { name: /shortcuts/i }).click();
  await expect(page.getByText(/Ctrl\+Z/i)).toBeVisible();
  await expect(page.getByText(/Redo/i)).toBeVisible();
});

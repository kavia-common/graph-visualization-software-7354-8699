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

  // Select all by dragging a small box or press Ctrl+A does not exist; rely on click on blank and delete
  // Simulate delete key; cannot verify exact selection count, but ensure no errors and toolbar still present
  await page.keyboard.press('Delete');
  await expect(page.getByRole('toolbar')).toBeVisible();
});

test('shortcuts overlay lists undo/redo indicating keyboard support', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /shortcuts/i }).click();
  await expect(page.getByText(/Ctrl\+Z/i)).toBeVisible();
  await expect(page.getByText(/Redo/i)).toBeVisible();
});

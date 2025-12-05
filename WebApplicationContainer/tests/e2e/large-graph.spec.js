import { test, expect } from '@playwright/test';

test('add 100 nodes without UI lag regression', async ({ page }) => {
  await page.goto('/');
  const toolbar = page.getByRole('toolbar');
  const addBtn = toolbar.getByRole('button', { name: /\+ node/i });
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    await addBtn.click();
  }
  const elapsed = Date.now() - start;
  // Loose threshold to catch severe regressions; CI machines vary
  expect(elapsed).toBeLessThan(8000);
  await expect(page.getByText(/FPS:/i)).toBeVisible();
});

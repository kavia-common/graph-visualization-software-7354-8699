import { test, expect } from '@playwright/test';

test.describe('Graph Editor basic UX', () => {
  test('read-only toggle disables editing actions', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.getByRole('toolbar');
    await expect(toolbar).toBeVisible();
    const roBtn = page.getByTestId('toolbar-toggle-readonly');
    await roBtn.click();
    await expect(page.getByRole('button', { name: /read-only/i })).toBeVisible();
    await expect(page.getByTestId('toolbar-add-node')).toBeDisabled();
    await expect(page.getByTestId('toolbar-delete')).toBeDisabled();
  });

  test('shortcuts overlay toggles', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.getByRole('toolbar');
    const shortcuts = toolbar.getByRole('button', { name: /shortcuts/i });
    await shortcuts.click();
    await expect(page.getByText(/Keyboard Shortcuts/i)).toBeVisible();
  });

  test('import/export buttons are present', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.getByRole('toolbar');
    await expect(toolbar.getByRole('button', { name: /import/i })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: /^export$/i })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: /Export \(\.gz\)/i })).toBeVisible();
  });
});

test.describe('Large graph sanity and perf baseline', () => {
  test('can add multiple nodes quickly and HUD visible', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.getByRole('toolbar');
    const addBtn = toolbar.getByRole('button', { name: /\+ node/i });
    // Add 25 nodes as a quick sanity baseline
    for (let i = 0; i < 25; i++) {
      await addBtn.click();
    }
    // HUD should be visible and show FPS
    await expect(page.getByText(/FPS:/i)).toBeVisible();
  });

  test('basic performance baseline: render completes within time budget', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.getByRole('toolbar').waitFor({ state: 'visible' });
    const duration = Date.now() - start;
    // Budget: 2s for cold start on CI
    expect(duration).toBeLessThan(2000);
  });
});

import { test, expect } from '@playwright/test';

test('export buttons initiate download (navigational click allowed)', async ({ page }) => {
  await page.goto('/');
  // Scope to toolbar to avoid ambiguous buttons elsewhere
  const toolbar = page.getByRole('toolbar');
  const exportBtn = toolbar.getByRole('button', { name: /^export$/i });

  // Tie the download wait to the page object to avoid context ambiguity
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportBtn.click(),
  ]);

  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/graph-design-v1\.json$/i);
});

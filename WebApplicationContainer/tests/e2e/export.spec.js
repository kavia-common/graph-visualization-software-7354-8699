import { test, expect } from '@playwright/test';

test('export JSON initiates download (navigational click allowed)', async ({ page }) => {
  await page.goto('/');
  const exportBtn = page.getByTestId('toolbar-export');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportBtn.click(),
  ]);

  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/graph-design-v\\d+\\.json$/i);
});

test('export GZ initiates download (navigational click allowed)', async ({ page }) => {
  await page.goto('/');
  const exportGzBtn = page.getByTestId('toolbar-export-gz');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    exportGzBtn.click(),
  ]);

  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/graph-design-v\\d+\\.json\\.gz$/i);
});

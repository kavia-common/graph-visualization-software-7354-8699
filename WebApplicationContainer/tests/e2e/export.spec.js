import { test, expect } from '@playwright/test';

test('export buttons initiate download (navigational click allowed)', async ({ page, context }) => {
  await page.goto('/');
  const [ download ] = await Promise.all([
    context.waitForEvent('download'),
    page.getByRole('button', { name: /^export$/i }).click(),
  ]);
  const suggested = download.suggestedFilename();
  expect(suggested).toMatch(/graph-design-v1\.json$/i);
});

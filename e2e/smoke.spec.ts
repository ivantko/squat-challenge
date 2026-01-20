import { test, expect } from '@playwright/test';
import { hasSupabaseEnv, getBaseUrl } from './helpers/env';
import { getSupabaseAdminClient } from './helpers/supabase-admin';

test.describe('auth + dashboard smoke', () => {
  test.skip(!hasSupabaseEnv(), 'Supabase env not configured for E2E');

  test('can sign in via generated magic link and log an entry', async ({ page }) => {
    const baseURL = getBaseUrl();

    // Unauthed -> should land on login (middleware-gated).
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);

    // Create a disposable user and generate a magic link.
    const admin = getSupabaseAdminClient();
    // Use a real domain because some hosted SMTP/validation setups reject reserved/test domains.
    // This does not require a real inbox: we use admin.generateLink() and navigate to the action_link.
    const email = `e2e+${Date.now()}@gmail.com`;

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${baseURL}/auth/confirm?next=/dashboard`,
      },
    });

    if (error) {
      test.skip(true, `Supabase admin auth not available: ${error.message}`);
    }

    expect(data?.properties?.action_link).toBeTruthy();

    // Visit action link -> should exchange token in /auth/confirm and land on dashboard.
    await page.goto(data!.properties!.action_link!);
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(page.getByRole('heading', { name: 'Challenge Ranking' })).toBeVisible();

    // Select the first participant from the podium (should be the current user after join).
    await page
      .locator('button[aria-label^="View "]')
      .first()
      .click();

    await expect(page.getByText('Log an entry')).toBeVisible();

    // Mark win + set percentile.
    await page.getByLabel('Mark as win').check();
    await page.locator('input[type="range"]').evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '20';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.getByRole('button', { name: 'Save entry' }).click();
    await expect(page.getByText('Saved.')).toBeVisible();
  });
});


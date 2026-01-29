import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display home page correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Tennis Matcher/);
    await expect(page.getByText('Tennis Matcher')).toBeVisible();
    await expect(page.getByText('테니스 동호회를 위한 스마트 대진표 생성 서비스')).toBeVisible();
  });

  test('should navigate to players page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '참가자 관리' }).click();
    await expect(page).toHaveURL('/players');
  });

  test('should navigate to events page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '이벤트 관리' }).click();
    await expect(page).toHaveURL('/events');
  });

  test('should navigate to stats page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: '통계 보기' }).click();
    await expect(page).toHaveURL('/stats');
  });
});

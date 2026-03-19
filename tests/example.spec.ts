import { test, expect } from '@playwright/test'
import { setupMockAPI } from './fixtures/mockGitHubAPI'

test('搜尋已知存在的使用者，能看到 repo 列表', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 顯示搜尋目標名稱
  await expect(page.getByText('mockuser').first()).toBeVisible()

  // 至少出現第一頁 10 張 RepoCard
  const cards = page.locator('a[href*="github.com/mockuser"]')
  await expect(cards).toHaveCount(10, { timeout: 10000 })
})

test('搜尋不存在的使用者，顯示 404 紅字提示', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('nobody-xyz-404')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 錯誤訊息文字出現
  const errorMsg = page.getByText('找不到使用者')
  await expect(errorMsg).toBeVisible({ timeout: 8000 })

  // 確認文字顏色是紅色系
  await expect(errorMsg).toHaveCSS('color', 'rgb(248, 113, 113)')

  // 不應出現任何 repo 卡片
  await expect(page.locator('a[href*="github.com"]')).toHaveCount(0)
})

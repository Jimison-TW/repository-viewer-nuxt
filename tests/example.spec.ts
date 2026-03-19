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

test('滾動到底，自動載入下一頁，累積達 30 筆以上', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 等待第一頁載入完成
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(10, { timeout: 10000 })

  // 第一次滾到底，觸發第二頁
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(20, { timeout: 10000 })

  // 第二次滾到底，觸發第三頁
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(30, { timeout: 10000 })
})

test('最後一頁結束後，顯示「已顯示全部 N 個儲存庫」', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 依次滾動直到三頁全部載入
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(800)
  }

  // 出現完成文字
  await expect(page.getByText('已顯示全部')).toBeVisible({ timeout: 12000 })
  await expect(page.getByText('30 個儲存庫')).toBeVisible()
})

test('清空搜尋框，回到初始畫面，不殘留舊資料', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  const input = page.getByPlaceholder('輸入 GitHub 使用者名稱...')
  await input.fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 等待 repo 出現
  await expect(page.locator('a[href*="github.com/mockuser"]').first()).toBeVisible({ timeout: 10000 })

  // 清空輸入框（triple-click 全選後 Backspace）
  await input.tripleClick()
  await input.press('Backspace')

  // 回到初始提示畫面
  await expect(page.getByText('輸入 GitHub 使用者名稱以搜尋儲存庫')).toBeVisible()

  // repo 列表消失
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(0)
})

test('低速網路（delayed API）下，loading 狀態正確顯示', async ({ page }) => {
  // 模擬 API 延遲 1.5 秒，讓 loading 狀態有時間被看到
  await page.route('**/api.github.com/users/mockuser', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'mockuser' }) })
  })

  await page.goto('/')
  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 在 API 回應前，按鈕應顯示「搜尋中」
  await expect(page.getByRole('button', { name: '搜尋中' })).toBeVisible()

  // 完成後「搜尋中」消失
  await expect(page.getByRole('button', { name: '搜尋中' })).not.toBeVisible({ timeout: 10000 })
})

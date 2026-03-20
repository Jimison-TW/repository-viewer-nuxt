import { test, expect, type Page } from '@playwright/test'
import { setupMockAPI } from './fixtures/mockGitHubAPI'

/**
 * 注入 IntersectionObserver mock，讓 observe() 呼叫後每 500ms 持續觸發 callback。
 * 解決 headless Chromium 無法透過 viewport 偵測 intersection 的問題。
 * 必須在 page.goto() 之前呼叫（透過 addInitScript）。
 */
async function injectIntersectionObserverMock(page: Page) {
  await page.addInitScript(() => {
    class MockIntersectionObserver {
      private callback: IntersectionObserverCallback
      private timer: ReturnType<typeof setInterval> | null = null
      private target: Element | null = null
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }
      observe(target: Element) {
        this.target = target
        if (this.timer) return
        this.timer = setInterval(() => {
          if (this.target) {
            this.callback(
              [{ isIntersecting: true, target: this.target } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            )
          }
        }, 500)
      }
      unobserve() {}
      disconnect() {
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = null
        }
      }
    }
    window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })
}

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
  await page.setViewportSize({ width: 1280, height: 500 })
  await setupMockAPI(page)
  // 注入 IO mock：每 500ms 持續觸發 isIntersecting=true，繞過 headless 環境 viewport 限制
  await injectIntersectionObserverMock(page)

  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // mock observer 每 500ms 觸發一次，loading guard 會過濾重複呼叫，三頁依序載完
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(10, { timeout: 10000 })
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(20, { timeout: 10000 })
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(30, { timeout: 10000 })
})

test('最後一頁結束後，顯示「已顯示全部 N 個儲存庫」', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 })
  await setupMockAPI(page)
  await injectIntersectionObserverMock(page)

  await page.goto('/')

  await page.getByPlaceholder('輸入 GitHub 使用者名稱...').fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 三頁依序自動觸發載入
  await expect(page.locator('a[href*="github.com/mockuser"]')).toHaveCount(30, { timeout: 15000 })

  // 最後一頁載完，顯示完成文字
  await expect(page.getByText('已顯示全部 30 個儲存庫')).toBeVisible({ timeout: 8000 })
})

test('清空搜尋框，回到初始畫面，不殘留舊資料', async ({ page }) => {
  await setupMockAPI(page)
  await page.goto('/')

  const input = page.getByPlaceholder('輸入 GitHub 使用者名稱...')
  await input.fill('mockuser')
  await page.getByRole('button', { name: '搜尋' }).click()

  // 等待 repo 出現
  await expect(page.locator('a[href*="github.com/mockuser"]').first()).toBeVisible({ timeout: 10000 })

  // 清空輸入框
  await input.fill('')

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

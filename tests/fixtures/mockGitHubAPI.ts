import type { Page } from '@playwright/test'

/** 產生 n 筆假 repo 資料 */
function makeRepos(count: number, startId = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    name: `repo-${startId + i}`,
    full_name: `mockuser/repo-${startId + i}`,
    html_url: `https://github.com/mockuser/repo-${startId + i}`,
    description: `Description for repo-${startId + i}`,
    language: 'TypeScript',
    visibility: 'public',
    stargazers_count: i,
    forks_count: 0,
    updated_at: '2024-01-01T00:00:00Z',
    fork: false,
    private: false,
  }))
}

/**
 * 攔截 GitHub API 請求，回傳受控的假資料。
 * - mockuser：共 30 筆 (page1: 10 筆 + next, page2: 10 筆 + next, page3: 10 筆, 無 next)
 * - nobody-xyz-404：回傳 404
 */
export async function setupMockAPI(page: Page) {
  // --- 使用者驗證 ---
  await page.route('**/api.github.com/users/mockuser', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ login: 'mockuser' }) })
  })

  await page.route('**/api.github.com/users/nobody-xyz-404', (route) => {
    route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not Found' }) })
  })

  // --- Repos 分頁（共 30 筆，3 頁） ---
  await page.route('**/api.github.com/users/mockuser/repos?**', (route, request) => {
    const url = new URL(request.url())
    const pageNum = Number(url.searchParams.get('page') ?? '1')

    let repos: ReturnType<typeof makeRepos> = []
    let linkHeader = ''

    if (pageNum === 1) {
      repos = makeRepos(10, 0)
      linkHeader = '<https://api.github.com/users/mockuser/repos?page=2>; rel="next"'
    } else if (pageNum === 2) {
      repos = makeRepos(10, 10)
      linkHeader = '<https://api.github.com/users/mockuser/repos?page=3>; rel="next"'
    } else if (pageNum === 3) {
      repos = makeRepos(10, 20)
      // 最後一頁，不帶 rel="next"
      linkHeader = ''
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: linkHeader ? { Link: linkHeader } : {},
      body: JSON.stringify(repos),
    })
  })
}

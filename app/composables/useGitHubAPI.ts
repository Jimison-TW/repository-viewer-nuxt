import type { GitHubAPIError, ListUserReposResponse } from '~/types/github'

/**
 * @description 分頁載入指定 GitHub 使用者公開儲存庫的 Composable。
 *
 * 採用 GitHub API 的 `Link` 回應標頭判斷是否還有下一頁，
 * 而非依賴資料筆數（例如 `data.length < per_page`），
 * 原因在於最後一頁的資料筆數可能剛好等於 per_page，
 * 用筆數判斷會誤認為還有下一頁而發出多餘的空請求。
 *
 * @param {string} username - 要載入儲存庫的 GitHub 使用者名稱
 * @returns {{ repos, loading, hasMore, fetchError, fetchRepos }} 回應式狀態與載入函式
 *
 * @example
 * const { repos, loading, hasMore, fetchError, fetchRepos } = useListUserReposAPI('google')
 */
export const useListUserReposAPI = (username: string) => {
  // 已載入的儲存庫清單，每次 fetchRepos 成功後累積
  const repos = ref<ListUserReposResponse>([])
  // 目前要請求的頁碼，每次成功後 +1
  const page = ref(1)
  // 是否正在請求中，避免重複觸發並發請求
  const loading = ref(false)
  // 是否還有更多資料可載入（依 Link header 的 rel="next" 判斷）
  const hasMore = ref(true)
  // API 錯誤訊息，有值時顯示於 RepoList 的重試區塊
  const fetchError = ref<string>('')

  /**
   * @description 請求下一頁儲存庫資料並累積至 repos。
   * 開頭的雙重 guard 確保：正在載入中或已無資料時不發出請求，
   * 讓 IntersectionObserver 可以無顧慮地頻繁觸發此函式。
   */
  const fetchRepos = async () => {
    // guard：避免重複並發請求，或在已知無更多資料時繼續請求
    if (loading.value || !hasMore.value) return

    loading.value = true
    // 每次新請求開始前清除殘留的錯誤訊息，確保使用者重試後介面能正確更新
    fetchError.value = ''
    try {
      /*
       * 使用 $fetch.raw 而非 $fetch 的原因：
       * 需要讀取原始 Response 物件的 `Link` 標頭來判斷分頁狀態，
       * 而 $fetch 只回傳解析後的 JSON body，無法存取 headers。
       */
      const response = await $fetch.raw<ListUserReposResponse>(`https://api.github.com/users/${username}/repos`, {
        query: {
          per_page: 10,
          page: page.value,
          sort: 'updated'
        }
      })

      const data = response._data ?? []
      const linkHeader = response.headers.get('Link') ?? ''

      // 有 rel="next" 才代表還有下一頁，否則後續 IO 觸發將被 guard 攔截
      hasMore.value = linkHeader.includes('rel="next"')

      // 累積資料（而非替換），實現無限滾動的視覺效果
      repos.value.push(...data)
      page.value++
    } catch (error: unknown) {
      const status = (error as GitHubAPIError)?.response?.status

      // 依 HTTP 狀態碼回傳對使用者有意義的錯誤說明
      switch (status) {
      case 301:
        fetchError.value = '使用者已更名，請更新路徑'
        break
      case 403:
        fetchError.value = 'GitHub API 請求已達上限，請稍後再試。'
        break
      case 404:
        fetchError.value = '找不到該使用者，請檢查帳號是否正確'
        break
      default:
        fetchError.value = '載入失敗，請點擊重試。'
      }
    } finally {
      loading.value = false
    }
  }

  return { repos, loading, hasMore, fetchError, fetchRepos }
}
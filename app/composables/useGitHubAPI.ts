import type { GitHubAPIError, ListUserReposResponse } from '~/types/github'

export const useListUserReposAPI = (username: string) => {
  const repos = ref<ListUserReposResponse>([])
  const page = ref(1)
  const loading = ref(false)
  const hasMore = ref(true)
  const fetchError = ref<string>('')

  const fetchRepos = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    try {
      const response = await $fetch.raw<ListUserReposResponse>(`https://api.github.com/users/${username}/repos`, {
        query: {
          per_page: 10,
          page: page.value,
          sort: 'updated'
        }
      })
      console.log('GitHub API Response:', response)

      const data = response._data ?? []
      const linkHeader = response.headers.get('Link') ?? ''

      // 有 rel="next" 才代表還有下一頁
      hasMore.value = linkHeader.includes('rel="next"')

      repos.value.push(...data)
      page.value++
    } catch (error: unknown) {
      const status = (error as GitHubAPIError)?.response?.status

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
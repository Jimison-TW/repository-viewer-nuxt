import type { ListUserReposResponse } from '~/types/github'

export const useListUserReposAPI = (username: string) => {
  const repos = ref<ListUserReposResponse>([])
  const page = ref(1)
  const loading = ref(false)
  const hasMore = ref(true)

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
    } catch (error) {
      console.error('GitHub API Error:', error)
    } finally {
      loading.value = false
    }
  }

  return { repos, loading, hasMore, fetchRepos }
}
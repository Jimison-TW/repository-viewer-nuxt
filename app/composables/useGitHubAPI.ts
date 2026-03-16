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
      const data = await $fetch<ListUserReposResponse>(`https://api.github.com/users/${username}/repos`, {
        query: {
          per_page: 10,
          page: page.value,
          sort: 'updated'
        }
      })

      if (data.length < 10) hasMore.value = false

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
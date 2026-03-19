<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RepoCard
        v-for="repo in repos"
        :key="repo.id"
        :repo="repo"
      />
    </div>

    <!-- 無限滾動哨兵元素 -->
    <div ref="sentinelRef" class="flex justify-center items-center py-10">
      <template v-if="loading">
        <div class="flex items-center gap-3 text-slate-400 text-sm">
          <svg
            class="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          載入中...
        </div>
      </template>
      <template v-else-if="!hasMore">
        <p class="text-slate-500 text-sm">
          已顯示全部 {{ repos.length }} 個儲存庫
        </p>
      </template>
      <template v-else-if="fetchError">
        <div class="flex flex-col items-center gap-2 text-red-400 text-sm">
          <p>{{ fetchError }}</p>
          <button class="text-blue-400 underline" @click="fetchRepos">重試</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  username?: string
}>(), {
  username: 'google',
})

const { repos, loading, hasMore, fetchError, fetchRepos } = useListUserReposAPI(props.username)

const sentinelRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

onMounted(async () => {
  // 初始載入第一批資料
  await fetchRepos()

  // 使用 IntersectionObserver 實作無限滾動
  observer = new IntersectionObserver(
    (entries) => {
      // 同步判斷，不用 async，改由 fetchRepos 內部的 loading guard 保護
      if (entries[0]?.isIntersecting) {
        fetchRepos() // fetchRepos 開頭已有 if (loading.value) return 防護
      }
    },
    { threshold: 0.1 },
  )

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

onUnmounted(() => observer?.disconnect())
</script>

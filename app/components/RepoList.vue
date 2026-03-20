<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!--
        首次載入時（尚無任何資料）顯示 9 個骨架屏佔位，
        避免畫面空白造成版面抖動（Layout Shift）。
        後續分頁載入時 repos 已有資料，直接顯示真實卡片。
      -->
      <template v-if="loading && repos.length === 0">
        <RepoCardSkeleton v-for="n in 9" :key="n" />
      </template>
      <template v-else>
        <RepoCard v-for="repo in repos" :key="repo.id" :repo="repo" />
      </template>
    </div>

    <!--
      無限滾動哨兵元素（Scroll Sentinel）。
      IntersectionObserver 監聽此元素是否進入 viewport，
      一旦進入便觸發下一頁資料載入。
      data-testid 供 Playwright E2E 測試定位使用。
    -->
    <div ref="sentinelRef" data-testid="scroll-sentinel" class="flex justify-center items-center py-10">
      <!-- 分頁載入中：顯示旋轉動畫，表示正在請求下一批資料 -->
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
      <!-- 全部資料已載完：顯示完成訊息，停止 IntersectionObserver 觸發 -->
      <template v-else-if="!hasMore">
        <p class="text-slate-500 text-sm">
          已顯示全部 {{ repos.length }} 個儲存庫
        </p>
      </template>
      <!-- 載入失敗：顯示錯誤訊息並提供重試按鈕，讓使用者手動觸發重新請求 -->
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
  /** 要載入儲存庫清單的 GitHub 使用者名稱 */
  username?: string
}>(), {
  username: 'google',
})

const { repos, loading, hasMore, fetchError, fetchRepos } = useListUserReposAPI(props.username)

// 哨兵元素的 DOM 參照，交由 IntersectionObserver 監聽
const sentinelRef = ref<HTMLElement | null>(null)

// observer 宣告在 setup 頂層，讓 onUnmounted 可以取得參照並清理
let observer: IntersectionObserver | null = null

onMounted(async () => {
  // 元件掛載後立即載入第一頁資料
  await fetchRepos()

  /*
   * 設置 IntersectionObserver 實作無限滾動。
   * threshold: 0.1 表示哨兵元素有 10% 進入 viewport 時即觸發，
   * 讓載入動作稍早於使用者真正滾到底部，體驗更流暢。
   */
  observer = new IntersectionObserver(
    (entries) => {
      // 使用同步判斷而非 async callback，避免競態條件。
      // fetchRepos 內部的 loading/hasMore guard 負責防止重複並發請求。
      if (entries[0]?.isIntersecting) {
        fetchRepos()
      }
    },
    { threshold: 0.1 },
  )

  // sentinelRef 在 v-if 條件下可能為 null，guard 後才 observe
  if (sentinelRef.value) {
    observer.observe(sentinelRef.value)
  }
})

// 元件卸載時斷開 observer，防止記憶體洩漏
onUnmounted(() => observer?.disconnect())
</script>

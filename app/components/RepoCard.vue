<template>
  <!--
    整張卡片為可點擊的外部連結，直接帶往 GitHub 儲存庫頁面。
    rel="noopener noreferrer" 防止新分頁透過 window.opener 存取來源頁面（安全性最佳實踐）。
  -->
  <a
    :href="repo.html_url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`前往 ${repo.full_name} 的 GitHub 頁面`"
    class="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-700 hover:border-slate-500 transition-colors duration-200 cursor-pointer"
  >
    <!-- 儲存庫名稱 + 公/私有標籤 -->
    <div class="flex items-start justify-between gap-2 mb-2">
      <h3 class="text-blue-400 font-semibold text-base truncate hover:underline">
        {{ repo.name }}
      </h3>
      <span
        v-if="repo.visibility"
        class="shrink-0 text-xs border border-slate-500 text-slate-400 rounded-full px-2 py-0.5"
      >
        {{ repo.visibility }}
      </span>
    </div>

    <!-- 儲存庫描述，無描述時顯示預設提示文字 -->
    <p class="text-slate-400 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
      {{ repo.description || '暫無說明' }}
    </p>

    <!-- 統計資訊列：程式語言、星數、fork 數、最近更新時間 -->
    <div class="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
      <span v-if="repo.language" class="flex items-center gap-1.5">
        <!-- 語言色點，固定使用 blue-400 代表語言標記 -->
        <span class="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
        {{ repo.language }}
      </span>

      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.873 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
        </svg>
        {{ repo.stargazers_count ?? 0 }}
      </span>

      <span class="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0z" />
        </svg>
        {{ repo.forks_count ?? 0 }}
      </span>

      <span v-if="repo.updated_at" class="ml-auto">
        更新於 {{ formatDate(repo.updated_at) }}
      </span>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { ListUserReposItem } from '~/types/github'

const { repo } = defineProps<{ repo: ListUserReposItem }>()

/**
 * @description 將 GitHub API 回傳的 ISO 8601 日期字串轉換為台灣在地化短日期格式。
 * 使用 `zh-TW` 地區設定，讓日期顯示符合台灣使用者閱讀習慣（例如「2024年1月15日」）。
 * @param {string} dateStr - ISO 8601 格式的日期字串（例如 "2024-01-15T08:00:00Z"）
 * @returns {string} 格式化後的在地化日期字串
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

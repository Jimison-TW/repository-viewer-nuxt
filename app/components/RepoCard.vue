<template>
  <a
    :href="repo.html_url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`前往 ${repo.full_name} 的 GitHub 頁面`"
    class="block bg-slate-800 border border-slate-700 rounded-xl p-5 hover:bg-slate-700 hover:border-slate-500 transition-colors duration-200 cursor-pointer"
  >
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

    <p class="text-slate-400 text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
      {{ repo.description || '暫無說明' }}
    </p>

    <div class="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
      <span v-if="repo.language" class="flex items-center gap-1.5">
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

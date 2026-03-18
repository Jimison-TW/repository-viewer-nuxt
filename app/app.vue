<template>
  <div class="min-h-screen bg-slate-900">
    <AppHeader title="Repository Viewer" />
    <SearchBar @search="onSearch" @clear="onClear" />

    <div v-if="activeUsername">
      <RepoList :key="activeUsername" :username="activeUsername" />
    </div>
    <div v-else class="flex flex-col items-center justify-center py-24 text-slate-500 text-sm gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <p>輸入 GitHub 使用者名稱以搜尋儲存庫</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeUsername = ref('')

function onSearch(username: string) {
  activeUsername.value = username
}

function onClear() {
  activeUsername.value = ''
}
</script>

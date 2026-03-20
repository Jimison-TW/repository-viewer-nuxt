<template>
  <div class="min-h-screen bg-slate-900">
    <AppHeader title="Repository Viewer" />
    <SearchBar @search="onSearch" @clear="onClear" />

    <!--
      activeUsername 有值時才渲染 RepoList。
      :key="activeUsername" 的用途：當使用者切換搜尋目標時，
      Vue 會銷毀並重建 RepoList，確保分頁狀態、請求與資料全部歸零，
      避免舊使用者的資料殘留在清單中。
    -->
    <div v-if="activeUsername">
      <RepoList :key="activeUsername" :username="activeUsername" />
    </div>
    <!-- 尚未搜尋時顯示引導提示，告知使用者如何開始 -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-slate-500 text-sm gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <p>輸入 GitHub 使用者名稱以搜尋儲存庫</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 已確認的搜尋目標使用者名稱，作為 RepoList 的資料來源與渲染條件
const activeUsername = ref('')

// 接收 SearchBar 驗證成功後的使用者名稱，觸發 RepoList 渲染
function onSearch(username: string) {
  activeUsername.value = username
}

// 接收 SearchBar 清空事件，隱藏 RepoList 並回到初始引導畫面
function onClear() {
  activeUsername.value = ''
}
</script>

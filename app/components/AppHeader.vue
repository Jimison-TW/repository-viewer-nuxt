<template>
  <header class="w-full bg-slate-900 border-b border-slate-700 shadow-md">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
      <h1 class="text-white text-xl font-semibold tracking-wide">
        {{ title }}
      </h1>
    </div>
  </header>
</template>

<script setup lang="ts">
// 頁面頂部全幅標題列，統一管理應用程式名稱的顯示
withDefaults(defineProps<{
  /** 顯示於標題列的文字，不傳入時預設為 'Repository Viewer' */
  title?: string
}>(), {
  title: 'Repository Viewer',
})
</script>

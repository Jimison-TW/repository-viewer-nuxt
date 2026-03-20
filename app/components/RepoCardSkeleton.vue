<!--
  RepoCard 的骨架屏（Skeleton Screen）版本，在資料載入期間佔位顯示。
  animate-pulse 產生呼吸感動畫，讓使用者感知內容即將出現，改善等待體驗。
  各色塊的寬度比例對應 RepoCard 實際內容的版面配置。
-->
<template>
  <div class="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse">
    <!-- 標題列佔位 -->
    <div class="h-4 bg-slate-700 rounded w-2/3 mb-3" />
    <!-- 描述文字佔位（兩行） -->
    <div class="h-3 bg-slate-700 rounded w-full mb-1" />
    <div class="h-3 bg-slate-700 rounded w-4/5 mb-4" />
    <!-- 統計資訊列佔位（語言 + 數據） -->
    <div class="flex gap-4">
      <div class="h-3 bg-slate-700 rounded w-16" />
      <div class="h-3 bg-slate-700 rounded w-10" />
    </div>
  </div>
</template>
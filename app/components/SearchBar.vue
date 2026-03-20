<template>
  <div class="w-full border-b border-slate-700 bg-slate-900">
    <div class="max-w-2xl mx-auto px-6 py-4">
      <!-- 輸入列 + 搜尋按鈕 -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            v-model="inputValue"
            type="text"
            :placeholder="placeholder"
            class="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            @keydown.enter="onSearch"
          >
        </div>
        <button
          type="button"
          :disabled="loading || !inputValue.trim()"
          class="shrink-0 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium px-5 py-3 rounded-lg transition-colors"
          :aria-label="loading ? '搜尋中' : '搜尋'"
          @click="onSearch"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            搜尋中
          </span>
          <span v-else>搜尋</span>
        </button>
      </div>

      <!-- 搜尋結果提示區 -->
      <div v-if="confirmedUser || error" class="mt-3 min-h-[1.5rem]" role="status" aria-live="polite">
        <!-- 成功：顯示目標使用者名稱 -->
        <p v-if="confirmedUser && !error" class="text-sm text-slate-300">
          正在顯示
          <span class="font-semibold text-blue-400">{{ confirmedUser }}</span>
          的公開儲存庫
        </p>
        <!-- 失敗：紅字錯誤提示 -->
        <p v-else-if="error" class="flex items-center gap-1.5 text-sm text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定義元件對外發出的事件：確認使用者存在時傳出名稱；清空搜尋時通知父元件重置
const emit = defineEmits<{
  (e: 'search', username: string): void
  (e: 'clear'): void
}>()

withDefaults(defineProps<{
  /** 輸入框的佔位提示文字 */
  placeholder?: string
}>(), {
  placeholder: '輸入 GitHub 使用者名稱...',
})

// 輸入框的雙向綁定值
const inputValue = ref('')
// 是否正在呼叫 GitHub API 驗證使用者
const loading = ref(false)
// 驗證失敗的錯誤訊息
const error = ref('')
// 已成功驗證的使用者名稱，用於顯示「正在顯示 xxx 的儲存庫」
const confirmedUser = ref('')

/*
 * 監聽輸入框變動：當使用者清空輸入時，重置所有搜尋結果狀態，
 * 並向父元件發出 clear 事件，讓 app.vue 隱藏 RepoList。
 * 這樣不需等使用者重新按下搜尋按鈕，介面就能即時回到初始狀態。
 */
watch(inputValue, (val) => {
  if (!val.trim()) {
    error.value = ''
    confirmedUser.value = ''
    emit('clear')
  }
})

/**
 * @description 呼叫 GitHub Users API 驗證使用者是否存在，驗證成功後通知父元件載入儲存庫。
 * 在發出請求前先 guard loading 狀態，防止使用者在請求期間重複點擊觸發並發請求。
 */
async function onSearch() {
  const username = inputValue.value.trim()
  // 空值或請求進行中時忽略，防止送出無效請求
  if (!username || loading.value) return

  loading.value = true
  error.value = ''
  confirmedUser.value = ''

  try {
    // 透過 GET /users/{username} 確認使用者是否存在，而非直接打 repos API，
    // 可以拿到更明確的 404 錯誤並做出對應的提示文字
    await $fetch(`https://api.github.com/users/${username}`)
    confirmedUser.value = username
    emit('search', username)
  }
  catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 404) {
      error.value = `找不到使用者「${username}」，請確認名稱是否正確。`
    } else if (status === 403) {
      error.value = 'GitHub API 請求已達每小時上限，請稍後再試。'
    } else {
      error.value = '搜尋失敗，請稍後再試。'
    }
    // 驗證失敗時通知父元件清除舊的搜尋結果
    emit('clear')
  }
  finally {
    loading.value = false
  }
}
</script>

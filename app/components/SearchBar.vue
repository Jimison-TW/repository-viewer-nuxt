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
      <div v-if="confirmedUser" class="mt-3 min-h-[1.5rem]">
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
const emit = defineEmits<{
  (e: 'search', username: string): void
  (e: 'clear'): void
}>()

withDefaults(defineProps<{
  placeholder?: string
}>(), {
  placeholder: '輸入 GitHub 使用者名稱...',
})

const inputValue = ref('')
const loading = ref(false)
const error = ref('')
const confirmedUser = ref('')

// 輸入變動時重置結果
watch(inputValue, (val) => {
  if (!val.trim()) {
    error.value = ''
    confirmedUser.value = ''
    emit('clear')
  }
})

async function onSearch() {
  const username = inputValue.value.trim()
  if (!username || loading.value) return

  loading.value = true
  error.value = ''
  confirmedUser.value = ''

  try {
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
    emit('clear')
  }
  finally {
    loading.value = false
  }
}
</script>

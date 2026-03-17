<template>
  <div>
    <AppHeader />
  </div>
</template>

<script setup lang="ts">
const { repos, fetchRepos } = useListUserReposAPI('Google')

onMounted(async () => {
  console.log('測試開始：抓取第一頁資料')
  if (repos.value.length === 0) {
    await fetchRepos()
  }
  console.log('抓取結果：', repos.value)
})
</script>

// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // 這裡的物件對應的是新版的 Flat Config 結構
  files: ['**/*.ts', '**/*.vue'], // 指定生效的檔案
  rules: {
    // 禁止使用未定義的變數（TypeScript 專屬規則）
    '@typescript-eslint/no-unused-vars': 'warn',
    // 基礎格式設定
    quotes: ['error', 'single'], // 強制使用單引號
    semi: ['error', 'never'], // 強制不使用分號
    indent: ['error', 2], // 強制縮排 2 空格

    // Vue 相關設定
    'vue/multi-word-component-names': 'off', // 關閉元件名稱必須多單字的限制 (方便面試開發)
    'vue/html-indent': ['error', 2], // Vue 模板縮排

    // 程式碼品質
    'no-unused-vars': 'off', // 關閉原生檢查，改用 TS 檢查
    'no-console': 'off', // 開發期間允許 console.log
  },
})

---
name: 網頁元件開發
description: 定義Nuxt.js網頁元件建立流程，並且清楚標示相關開發規範
---

# 網頁元件開發

進行網頁元件開發時，請遵循以下規則

## 網頁元件元件建立流程

1. 若有參考圖片，請先檢視參考圖片內的顏色樣式與確認提示詞內的元件類型
2. 在`app/component/`目錄下新增該元件
3. 請使用Nuxt.js與Typescript建立新的元件檔案

## 1. 技術棧與環境

- **框架**: Nuxt 4 (Composition API) 使用 `<script setup lang="ts">`。
- **樣式工具**: Tailwind CSS（專案中通常會透過 `@/assets/css/tailwind.css` 或 `@/assets/css/main.css` 引入）。
- **UI 庫**: 無特定 UI 庫，請根據需求選擇適合的元件或自行撰寫。
- **圖示**: 優先使用專案 assets 中的 SVG 或第三方圖示庫（如 FontAwesome、Heroicons 等）。

## 2. 樣式與設計規範 (核心要點)

- **樣式原則**:
  - 優先使用 Tailwind 的工具類別（例如 `bg-slate-800`, `text-white`, `p-4`, `flex`, `gap-3`）。
  - 本專案不使用預設的 CSS 變數（例如 `--primary`、`--color-...` 等）。
  - 若需自定義色彩、間距或字體，請在 `tailwind.config.js` 中擴充 `theme` 並使用對應的 Tailwind 類別。
- **全域樣式**:
  - 主要樣式應由 Tailwind 的 `@layer base/components/utilities` 管理。
  - 若需額外自定義樣式，請新增 `@/assets/css/custom.css`（或相似檔案），並在 `nuxt.config.ts` 中載入。
- **Scoped Styles**:
  - 若在元件中撰寫自定義樣式，請使用 `<style scoped lang="scss">`。

## 3. 組件開發慣例

- **命名規範**: 元件檔案使用 PascalCase (例如：`TheSearchBar.vue`)。
- **Props**: 必須使用 `withDefaults(defineProps<{...}>(), {...})` 定義。
- **Emit**: 必須使用 `defineEmits<{(e: 'event', ...): void}>()` 定義。
- **雙向綁定**: 優先使用 `v-model` (Vue 3 語法)。

## 4. 邏輯與功能細節

- **防抖 (Debounce)**: 處理搜尋、輸入等頻繁觸發的事件時，必須實作防抖邏輯。
- **API 串接**: 假設專案使用 `axios`。處理非同步請求時必須包含 `try-cache` 塊與 `loading` 狀態管理。
- **清單渲染**: 所有的 `v-for` 必須綁定唯一的 `:key`。
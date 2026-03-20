# Repository Viewer

> 實作 GitHub Repositories 無限滾動瀏覽器

## 功能

- 輸入任意 GitHub 使用者名稱，即時搜尋並列出公開儲存庫
- 無限滾動：每次捲動到底自動載入下一頁（每頁 10 筆）
- 預設展示 **google** 的公開儲存庫（repos 數量充足，可驗證 30+ 筆需求）

## 技術選型

- **Nuxt 4** + Composition API
- **Tailwind CSS** 樣式
- **IntersectionObserver API** 實作無限滾動
- **GitHub REST API** `/users/{username}/repos`
- **ESLint** (`@nuxt/eslint`) 統一程式碼風格

## 快速開始

1. 安裝相關套件

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

2. 啟動開發環境

local server啟動後網址位於 `http://localhost:3000`

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

3. Production版本建立

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

4. Production版本預覽

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

## demo連結

[連結](https://jimison-tw.github.io/repository-viewer-nuxt/)
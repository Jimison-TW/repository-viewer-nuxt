// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-03-14',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
  ],
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
    }
  },
  app: {
    baseURL: '/repository-viewer-nuxt/',
    buildAssetsDir: 'assets', // 將底線改成普通資料夾名稱
  },
  // 建議加上這個，強制 Nuxt 進入靜態生成模式
  ssr: false,
  // 讓 Nitro 引擎生成的路徑更相容 GitHub Pages
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },
  typescript: {
    typeCheck: false, // 如果您有安裝 vue-tsc，可以設為 true
    tsConfig: {
      compilerOptions: {
        types: ['node'] // 確保這行存在，解決 process 報錯
      }
    }
  }
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: [
    'bootstrap/dist/css/bootstrap.css',
  ],
  build: {
    transpile: [
      '@popperjs/core',
    ],
  },
  
  nitro: {
    preset: 'node-server', // 使用 Node.js 伺服器作為部署方式
  },
  
})

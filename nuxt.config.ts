// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'QuickSim — AI 人生场景速推',
      meta: [
        { name: 'description', content: '选一个场景，回答2个问题，AI用真实数据为你推演未来。' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      htmlAttrs: { lang: 'zh-CN' },
    },
  },

  runtimeConfig: {
    llmApiKey: process.env.LLM_API_KEY || '',
    llmBaseUrl: process.env.LLM_BASE_URL || 'https://api.deepseek.com',
    llmModel: process.env.LLM_MODEL || 'deepseek-chat',
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
})

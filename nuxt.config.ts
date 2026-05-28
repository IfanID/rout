// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
  ],

  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
  },

  css: [
    '~~/assets/css/main.css'
  ],
})
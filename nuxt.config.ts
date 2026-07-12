export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
  ],

  colorMode: {
    preference: 'dark',
    classSuffix: '',
    fallback: 'dark',
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'id',
    locales: [
      { code: 'id', name: 'Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' },
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
  },

  css: [
    '@/assets/css/main.css',
  ],
})
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
  ],

  // Color Mode
  colorMode: {
    preference: 'dark',
    classSuffix: '',       // .dark / .light (bukan .dark-mode)
    fallback: 'dark',
  },

  // i18n
  i18n: {
    strategy: 'no_prefix', // <-- TAMBAHKAN INI (URL tetap bersih, tanpa /id/ atau /ko/)
    
    defaultLocale: 'id',
    locales: [
      { code: 'id', name: 'Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' },
    ],
    langDir: 'locales/',
    lazy: true,
    
    // Simpan bahasa ke localStorage
    detectBrowserLanguage: {
      useLocalStorage: true,
    }
  },

  css: [
    '@/assets/css/main.css',
  ],
})
export const useLanguage = () => {
  const { locale, setLocale, locales } = useI18n()

  // State untuk buka/tutup dropdown
  const isLangDropdownOpen = ref(false)

  // OTOMATIS: Ambil daftar bahasa langsung dari nuxt.config.ts
  // locales akan berisi: [{ code: 'id', name: 'Bahasa Indonesia' }, { code: 'en', name: 'English' }, ...]
  const availableLocales = computed(() => {
    return locales.value.map(l => (typeof l === 'object' ? l : { code: l, name: l }))
  })

  // Cari nama bahasa yang sedang aktif berdasarkan kode locale (id, en, ko)
  const currentLocaleName = computed(() => {
    const active = availableLocales.value.find(l => l.code === locale.value)
    return active ? active.name : 'Unknown'
  })

  // Fungsi toggle dropdown
  const toggleLangDropdown = () => {
    isLangDropdownOpen.value = !isLangDropdownOpen.value
  }

  // Fungsi ganti bahasa
  const changeLanguage = (code) => {
    setLocale(code)
    isLangDropdownOpen.value = false
  }

  // Fungsi tutup dropdown
  const closeLangDropdown = () => {
    isLangDropdownOpen.value = false
  }

  return {
    isLangDropdownOpen,
    availableLocales,      // Sekarang ini dinamis dari nuxt.config.ts
    currentLocaleName,
    toggleLangDropdown,
    changeLanguage,
    closeLangDropdown
  }
}
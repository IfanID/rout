export const useLanguage = () => {
  // Hanya mengurusi state UI dropdown (buka/tutup)
  // Logic i18n (locale, setLocale, dll) WAJIB dipanggil langsung di komponen
  // agar reactivity-nya terjaga dengan benar di Nuxt
  const isLangDropdownOpen = ref(false)

  const toggleLangDropdown = () => {
    isLangDropdownOpen.value = !isLangDropdownOpen.value
  }

  const closeLangDropdown = () => {
    isLangDropdownOpen.value = false
  }

  return {
    isLangDropdownOpen,
    toggleLangDropdown,
    closeLangDropdown
  }
}
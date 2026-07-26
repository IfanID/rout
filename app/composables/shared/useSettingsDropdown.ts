import { ref, computed, nextTick, watch } from 'vue'

interface MenuOption {
  value: string
  label: ComputedRef<string>
}

interface UseSettingsDropdownOptions {
  stateKey: string
  defaultValue: string
  menuOptions: MenuOption[]
}

export const useSettingsDropdown = (options: UseSettingsDropdownOptions) => {
  const { t, locale, locales, setLocale } = useI18n()

  // === LANGUAGE DROPDOWN ===
  const isLangDropdownOpen = ref(false)
  const toggleLangDropdown = () => { isLangDropdownOpen.value = !isLangDropdownOpen.value }
  const closeLangDropdown = () => { isLangDropdownOpen.value = false }

  const availableLocales = computed(() => {
    return locales.value.map(l => (typeof l === 'object' ? l : { code: l, name: l }))
  })

  const currentLocaleName = computed(() => {
    const active = availableLocales.value.find(l => l.code === locale.value)
    return active ? active.name : 'Unknown'
  })

  const changeLanguage = (code: string) => {
    setLocale(code)
    isLangDropdownOpen.value = false
  }

  // === THEME TOGGLE ===
  const colorMode = useColorMode()
  const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
  const themeIcon = computed(() => {
    return colorMode.value === 'dark'
      ? 'material-symbols:dark-mode-rounded'
      : 'material-symbols:light-mode-rounded'
  })

  // === CENTER BUTTON DROPDOWN ===
  const selectedMenu = useState(options.stateKey, () => options.defaultValue)
  const isDropdownOpen = ref(false)

  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
  }

  const selectOption = (value: string) => {
    selectedMenu.value = value
    isDropdownOpen.value = false
  }

  // === DROPDOWN OVERFLOW DETECTION ===
  const dropdownListRef = ref<HTMLElement | null>(null)
  const langDropdownListRef = ref<HTMLElement | null>(null)
  const isDropdownAbove = ref(false)
  const isLangDropdownAbove = ref(false)

  const checkOverflowBottom = (el: HTMLElement | null) => {
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.bottom > window.innerHeight - 8
  }

  watch(isDropdownOpen, (val) => {
    if (val) {
      nextTick(() => {
        isDropdownAbove.value = checkOverflowBottom(dropdownListRef.value)
      })
    }
  })

  watch(isLangDropdownOpen, (val) => {
    if (val) {
      nextTick(() => {
        isLangDropdownAbove.value = checkOverflowBottom(langDropdownListRef.value)
      })
    }
  })

  // === CLOSE ALL ===
  const closeAllDropdowns = () => {
    isDropdownOpen.value = false
    closeLangDropdown()
  }

  return {
    // Language
    isLangDropdownOpen,
    toggleLangDropdown,
    closeLangDropdown,
    availableLocales,
    currentLocaleName,
    changeLanguage,
    // Theme
    toggleTheme,
    themeIcon,
    colorMode,
    // Center button
    selectedMenu,
    isDropdownOpen,
    toggleDropdown,
    selectOption,
    menuOptions: options.menuOptions,
    // Overflow
    dropdownListRef,
    langDropdownListRef,
    isDropdownAbove,
    isLangDropdownAbove,
    // Close all
    closeAllDropdowns,
  }
}

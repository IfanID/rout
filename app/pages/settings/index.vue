<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const { t, locale, locales, setLocale } = useI18n()

// === DROPDOWN BAHASA (langsung di komponen, bukan di composable) ===
const {
  isLangDropdownOpen,
  toggleLangDropdown,
  closeLangDropdown
} = useLanguage()

const availableLocales = computed(() => {
  return locales.value.map(l => (typeof l === 'object' ? l : { code: l, name: l }))
})

const currentLocaleName = computed(() => {
  const active = availableLocales.value.find(l => l.code === locale.value)
  return active ? active.name : 'Unknown'
})

const changeLanguage = (code) => {
  setLocale(code)
  isLangDropdownOpen.value = false
}

// === COLOR MODE TOGGLE ===
const colorMode = useColorMode()
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
const themeIcon = computed(() => {
  return colorMode.value === 'dark'
    ? 'material-symbols:dark-mode-rounded'
    : 'material-symbols:light-mode-rounded'
})
const themeLabel = computed(() => {
  return colorMode.value === 'dark' ? t('pages.settings.theme_dark') : t('pages.settings.theme_light')
})

// === DROPDOWN TOMBOL PUSAT ===
const selectedMenu = usePersistedState('navCenterMenu', 'running-man')
const isDropdownOpen = ref(false)

const menuOptions = [
  { value: 'running-man', label: computed(() => t('components.centerMenu.running_man')) },
  { value: 'finance', label: computed(() => t('components.centerMenu.finance')) },
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectOption = (value) => {
  selectedMenu.value = value
  isDropdownOpen.value = false
}

// === DETEKSI DROPDOWN KELUAR VIEWPORT ===
const dropdownListRef = ref(null)
const langDropdownListRef = ref(null)
const isDropdownAbove = ref(false)
const isLangDropdownAbove = ref(false)

const checkOverflowBottom = (el) => {
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

// === TUTUP SEMUA DROPDOWN SAAT KLIK OVERLAY ===
const closeAllDropdowns = () => {
  isDropdownOpen.value = false
  closeLangDropdown()
}
</script>

<template>
  <div class="settings-page">
    
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('pages.settings.title') }}</h1>
      
      <div class="theme-icon-wrapper" :title="themeLabel" @click="toggleTheme">
        <Icon :name="themeIcon" size="24" class="theme-icon" />
      </div>
    </div>

    <!-- Section: Akun -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.settings.account') }}</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:person-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.settings.edit_profile') }}</span>
            <span class="item-desc">{{ t('pages.settings.edit_profile_desc') }}</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
        
        <div class="divider"></div>

        <div class="settings-item">
          <Icon name="material-symbols:lock-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.settings.security') }}</span>
            <span class="item-desc">{{ t('pages.settings.security_desc') }}</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Section: Tampilan -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.settings.appearance') }}</h2>
      <div class="settings-card">
        
        <!-- Dropdown Tombol Pusat -->
        <div class="settings-item dropdown-item" :class="{ 'z-active': isDropdownOpen }">
          <Icon name="material-symbols:dashboard-customize-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.settings.center_button') }}</span>
            <span class="item-desc">{{ t('pages.settings.center_button_desc') }}</span>
          </div>
          
          <div class="custom-dropdown">
            <button class="dropdown-trigger" @click="toggleDropdown">
              <ClientOnly>
                <span>{{ menuOptions.find(opt => opt.value === selectedMenu)?.label }}</span>
                <template #fallback>
                  <SkeletonDropdownText />
                </template>
              </ClientOnly>
              <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isDropdownOpen }" />
            </button>
            <div 
              v-if="isDropdownOpen" 
              ref="dropdownListRef"
              class="dropdown-list" 
              :class="{ 'dropdown-above': isDropdownAbove }"
            >
              <div v-for="option in menuOptions" :key="option.value" class="dropdown-option" :class="{ 'active': selectedMenu === option.value }" @click="selectOption(option.value)">
                {{ option.label }}
                <Icon v-if="selectedMenu === option.value" name="material-symbols:check-rounded" size="18" />
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Dropdown Bahasa -->
        <div class="settings-item dropdown-item" :class="{ 'z-active': isLangDropdownOpen }">
          <Icon name="material-symbols:translate-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.settings.language') }}</span>
          </div>
          
          <div class="custom-dropdown">
            <button class="dropdown-trigger" @click="toggleLangDropdown">
              <ClientOnly>
                <span>{{ currentLocaleName }}</span>
                <template #fallback>
                  <SkeletonDropdownText />
                </template>
              </ClientOnly>
              <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isLangDropdownOpen }" />
            </button>
            <div 
              v-if="isLangDropdownOpen" 
              ref="langDropdownListRef"
              class="dropdown-list" 
              :class="{ 'dropdown-above': isLangDropdownAbove }"
            >
              <div v-for="loc in availableLocales" :key="loc.code" class="dropdown-option" :class="{ 'active': locale === loc.code }" @click="changeLanguage(loc.code)">
                {{ loc.name }}
                <Icon v-if="locale === loc.code" name="material-symbols:check-rounded" size="18" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Section: Lainnya -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.settings.others') }}</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:info-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.settings.about') }}</span>
            <span class="item-desc">{{ t('pages.settings.about_version') }}</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="isDropdownOpen || isLangDropdownOpen" class="dropdown-overlay" @click="closeAllDropdowns"></div>
  </div>
</template>

<style scoped>
.settings-page { padding: 40px 20px; color: var(--md-sys-color-on-surface); position: relative; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-title { color: var(--md-sys-color-primary); margin: 0; font-size: 1.5rem; }
.theme-icon-wrapper { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); cursor: pointer; transition: var(--transition); }
.theme-icon-wrapper:hover { background-color: var(--md-sys-color-surface-variant); }
.theme-icon { color: var(--md-sys-color-primary); }
.settings-section { margin-bottom: 28px; position: relative; }
.section-title { font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px; padding-left: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
.settings-card { background-color: var(--md-sys-color-surface-container); border-radius: 16px; border: 1px solid var(--md-sys-color-outline-variant); }
.settings-item { display: flex; align-items: center; padding: 16px 20px; cursor: pointer; transition: background-color 0.2s; position: relative; }
.settings-item:first-child { border-radius: 16px 16px 0 0; }
.settings-item:last-child { border-radius: 0 0 16px 16px; }
.settings-item:only-child { border-radius: 16px; }
.settings-item:hover { background-color: var(--md-sys-color-surface-variant); }
.item-icon { color: var(--md-sys-color-primary); margin-right: 16px; }
.item-text { display: flex; flex-direction: column; flex: 1; gap: 2px; margin-right: 16px; }
.item-label { font-size: 0.95rem; font-weight: 500; }
.item-desc { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }
.chevron { color: var(--md-sys-color-on-surface-variant); }
.divider { height: 1px; background-color: var(--md-sys-color-outline-variant); margin: 0 20px; }
.dropdown-item { cursor: default; position: relative; z-index: 1; }
.dropdown-item.z-active { z-index: 50; }
.custom-dropdown { position: relative; z-index: 20; }
.dropdown-trigger { display: flex; align-items: center; justify-content: space-between; width: 140px; gap: 4px; background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; outline: none; transition: var(--transition); }
.dropdown-trigger:hover { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-secondary-container); }
.dropdown-arrow { transition: transform 0.2s ease; }
.dropdown-arrow.rotate { transform: rotate(180deg); }
.dropdown-list { position: absolute; top: calc(100% + 8px); right: 0; width: 180px; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden; z-index: 50; transition: top 0.15s ease, bottom 0.15s ease; }
.dropdown-list.dropdown-above { top: auto; bottom: calc(100% + 8px); }
.dropdown-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; font-size: 0.9rem; cursor: pointer; color: var(--md-sys-color-on-surface); transition: background-color 0.2s; }
.dropdown-option:hover { background-color: var(--md-sys-color-surface-variant); }
.dropdown-option.active { color: var(--md-sys-color-primary); font-weight: 600; background-color: var(--md-sys-color-primary-container); }
.dropdown-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10; background-color: transparent; }
</style>
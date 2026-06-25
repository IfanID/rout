<script setup>
import { ref } from 'vue'

const { t, locale } = useI18n()

// === PANGGIL COMPOSABLE BAHASA ===
const {
  isLangDropdownOpen,
  availableLocales,
  currentLocaleName,
  toggleLangDropdown,
  changeLanguage,
  closeLangDropdown
} = useLanguage()

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

// === LOGOUT ===
const showLogoutDialog = ref(false)
const confirmLogout = () => {
  showLogoutDialog.value = false
  navigateTo('/')
}

// === DROPDOWN TOMBOL PUSAT ===
const selectedMenu = usePersistedState('navFinanceCenter', 'analytics')
const isDropdownOpen = ref(false)

const menuOptions = [
  { value: 'analytics', label: computed(() => t('components.centerMenu.analytics')) },
  { value: 'debt', label: computed(() => t('components.centerMenu.debt')) },
  { value: 'pencatat', label: computed(() => t('components.centerMenu.pencatat')) },
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectOption = (value) => {
  selectedMenu.value = value
  isDropdownOpen.value = false
}

// === TUTUP SEMUA DROPDOWN ===
const closeAllDropdowns = () => {
  isDropdownOpen.value = false
  closeLangDropdown()
}
</script>

<template>
  <div class="finance-profile-page">
    
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('pages.finance.profile.title') }}</h1>
      
      <div class="header-actions">
        <div class="theme-icon-wrapper" @click="toggleTheme" :title="themeIcon === 'material-symbols:dark-mode-rounded' ? t('pages.settings.theme_dark') : t('pages.settings.theme_light')">
          <Icon :name="themeIcon" size="24" class="theme-icon" />
        </div>
        
        <div class="logout-icon-wrapper" :title="t('pages.finance.profile.logout')" @click="showLogoutDialog = true">
          <Icon name="material-symbols:logout-rounded" size="24" class="logout-icon" />
        </div>
      </div>
    </div>

    <!-- Kartu User -->
    <div class="profile-card">
      <Icon name="material-symbols:account-circle-rounded" size="64" class="profile-avatar" />
      <h2>Guest User</h2>
      <p>guest@finance.com</p>
    </div>

    <!-- Section: Tampilan -->
    <div class="menu-section">
      <h2 class="section-title">{{ t('pages.finance.profile.appearance') }}</h2>
      <div class="menu-card">
        
        <!-- Dropdown Tombol Pusat -->
        <div class="menu-item dropdown-item" :class="{ 'z-active': isDropdownOpen }">
          <Icon name="material-symbols:dashboard-customize-rounded" size="24" class="menu-icon" />
          <div class="menu-text">
            <span class="menu-label">{{ t('pages.finance.profile.center_button') }}</span>
            <span class="menu-desc">{{ t('pages.finance.profile.center_button_desc') }}</span>
          </div>
          
          <div class="custom-dropdown">
            <button class="dropdown-trigger" @click="toggleDropdown">
              <!-- GUNAKAN KOMPONEN SKELETON -->
              <ClientOnly>
                <span>{{ menuOptions.find(opt => opt.value === selectedMenu)?.label }}</span>
                <template #fallback>
                  <SkeletonDropdownText />
                </template>
              </ClientOnly>
              <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isDropdownOpen }" />
            </button>
            <div v-if="isDropdownOpen" class="dropdown-list">
              <div v-for="option in menuOptions" :key="option.value" class="dropdown-option" :class="{ 'active': selectedMenu === option.value }" @click="selectOption(option.value)">
                {{ option.label }}
                <Icon v-if="selectedMenu === option.value" name="material-symbols:check-rounded" size="18" />
              </div>
            </div>
          </div>
        </div>

        <div class="menu-divider"></div>

        <!-- Dropdown Bahasa -->
        <div class="menu-item dropdown-item" :class="{ 'z-active': isLangDropdownOpen }">
          <Icon name="material-symbols:translate-rounded" size="24" class="menu-icon" />
          <div class="menu-text">
            <span class="menu-label">{{ t('pages.settings.language') }}</span>
          </div>
          
          <div class="custom-dropdown">
            <button class="dropdown-trigger" @click="toggleLangDropdown">
              <!-- GUNAKAN KOMPONEN SKELETON -->
              <ClientOnly>
                <span>{{ currentLocaleName }}</span>
                <template #fallback>
                  <SkeletonDropdownText />
                </template>
              </ClientOnly>
              <Icon name="material-symbols:arrow-drop-down-rounded" size="20" class="dropdown-arrow" :class="{ 'rotate': isLangDropdownOpen }" />
            </button>
            <div v-if="isLangDropdownOpen" class="dropdown-list">
              <div v-for="loc in availableLocales" :key="loc.code" class="dropdown-option" :class="{ 'active': locale === loc.code }" @click="changeLanguage(loc.code)">
                {{ loc.name }}
                <Icon v-if="locale === loc.code" name="material-symbols:check-rounded" size="18" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Section: Menu -->
    <div class="menu-section">
      <h2 class="section-title">{{ t('pages.finance.profile.menu') }}</h2>
      <div class="menu-card">
        <div class="menu-item">
          <Icon name="material-symbols:settings-rounded" size="24" class="menu-icon" />
          <div class="menu-text">
            <span class="menu-label">{{ t('pages.finance.profile.account_settings') }}</span>
            <span class="menu-desc">{{ t('pages.finance.profile.account_settings_desc') }}</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Overlay dropdown -->
    <div v-if="isDropdownOpen || isLangDropdownOpen" class="dropdown-overlay" @click="closeAllDropdowns"></div>

    <!-- Dialog Logout -->
    <ConfirmDialog 
      v-if="showLogoutDialog"
      :title="t('pages.finance.profile.logout_dialog.title')"
      :message="t('pages.finance.profile.logout_dialog.message')"
      :confirmText="t('pages.finance.profile.logout_dialog.confirm')"
      :cancelText="t('pages.finance.profile.logout_dialog.cancel')"
      @confirm="confirmLogout"
      @cancel="showLogoutDialog = false"
    />
  </div>
</template>

<style scoped>
.finance-profile-page { padding: 40px 20px; color: var(--md-sys-color-on-surface); position: relative; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { color: var(--md-sys-color-primary); margin: 0; font-size: 1.5rem; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.theme-icon-wrapper, .logout-icon-wrapper { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); cursor: pointer; transition: var(--transition); }
.theme-icon-wrapper:hover, .logout-icon-wrapper:hover { background-color: var(--md-sys-color-surface-variant); }
.theme-icon { color: var(--md-sys-color-primary); }
.logout-icon { color: var(--md-sys-color-error); }
.profile-card { background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px; }
.profile-avatar { color: var(--md-sys-color-primary); margin-bottom: 8px; }
.profile-card h2 { margin: 8px 0 4px; font-size: 1.2rem; }
.profile-card p { margin: 0; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; }
.menu-section { margin-bottom: 28px; }
.section-title { font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px; padding-left: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
.menu-card { background-color: var(--md-sys-color-surface-container); border-radius: 16px; border: 1px solid var(--md-sys-color-outline-variant); }
.menu-item { display: flex; align-items: center; padding: 16px 20px; text-decoration: none; color: inherit; cursor: pointer; transition: background-color 0.2s; }
.menu-item:first-child { border-radius: 16px 16px 0 0; }
.menu-item:last-child { border-radius: 0 0 16px 16px; }
.menu-item:only-child { border-radius: 16px; }
.menu-item:hover { background-color: var(--md-sys-color-surface-variant); }
.menu-icon { color: var(--md-sys-color-primary); margin-right: 16px; }
.menu-text { display: flex; flex-direction: column; flex: 1; gap: 2px; margin-right: 16px; }
.menu-label { font-size: 0.95rem; font-weight: 500; color: var(--md-sys-color-on-surface); }
.menu-desc { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }
.chevron { color: var(--md-sys-color-on-surface-variant); }
.menu-divider { height: 1px; background-color: var(--md-sys-color-outline-variant); margin: 0 20px; }
.dropdown-item { cursor: default; position: relative; z-index: 1; }
.dropdown-item.z-active { z-index: 50; }
.custom-dropdown { position: relative; z-index: 20; }
.dropdown-trigger { display: flex; align-items: center; justify-content: space-between; width: 140px; gap: 4px; background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 8px; padding: 8px 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; outline: none; transition: var(--transition); }
.dropdown-trigger:hover { border-color: var(--md-sys-color-primary); background-color: var(--md-sys-color-secondary-container); }
.dropdown-arrow { transition: transform 0.2s ease; }
.dropdown-arrow.rotate { transform: rotate(180deg); }
.dropdown-list { position: absolute; top: calc(100% + 8px); right: 0; width: 180px; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden; z-index: 50; }
.dropdown-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; font-size: 0.9rem; cursor: pointer; color: var(--md-sys-color-on-surface); transition: background-color 0.2s; }
.dropdown-option:hover { background-color: var(--md-sys-color-surface-variant); }
.dropdown-option.active { color: var(--md-sys-color-primary); font-weight: 600; background-color: var(--md-sys-color-primary-container); }
.dropdown-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10; background-color: transparent; }
:deep(.dialog-overlay) { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0,0, 0, 0.5); z-index: 9999; display: flex; align-items: flex-start; justify-content: flex-end; padding: 90px 40px 20px 20px; animation: fadeIn 0.2s ease; }
:deep(.dialog-box) { background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 20px; padding: 20px; margin-right: 35px; width: 100%; max-width: 300px; box-shadow: var(--shadow-lg); animation: slideDown 0.2s ease; }
:deep(.dialog-title) { margin: 0 0 8px; font-size: 1.1rem; text-align: center; color: var(--md-sys-color-on-surface); }
:deep(.dialog-message) { margin: 0 0 20px; font-size: 0.9rem; text-align: center; color: var(--md-sys-color-on-surface-variant); line-height: 1.4; }
:deep(.dialog-actions) { display: flex; justify-content: center; gap: 10px; }
:deep(.dialog-btn) { flex: 1; background: transparent; border: none; padding: 10px 14px; border-radius: 50px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
:deep(.cancel-btn) { background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); }
:deep(.cancel-btn:hover) { background-color: var(--md-sys-color-outline-variant); }
:deep(.confirm-btn) { background-color: var(--md-sys-color-error); color: var(--md-sys-color-on-error); }
:deep(.confirm-btn:hover) { opacity: 0.9; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideDown { from { transform: translateY(-15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

</style>
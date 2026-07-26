<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettingsDropdown } from '~/composables/shared/useSettingsDropdown'

const { t } = useI18n()

const {
  isLangDropdownOpen, toggleLangDropdown,
  availableLocales, currentLocaleName, changeLanguage,
  toggleTheme, themeIcon,
  selectedMenu, isDropdownOpen, toggleDropdown, selectOption,
  menuOptions, dropdownListRef, langDropdownListRef,
  isDropdownAbove, isLangDropdownAbove, closeAllDropdowns
} = useSettingsDropdown({
  stateKey: 'navOwnerCenter',
  defaultValue: 'dashboard',
  menuOptions: [
    { value: 'dashboard', label: computed(() => t('pages.owner.settings.center_options.dashboard')) },
  ]
})

// === LOGOUT & POSISI DIALOG ===
const showLogoutDialog = ref(false)
const logoutBtnRef = ref<HTMLElement | null>(null)
const logoutDialogPos = ref({ top: '0px', right: '20px' })

const openLogoutDialog = () => {
  if (logoutBtnRef.value) {
    const rect = logoutBtnRef.value.getBoundingClientRect()
    
    let topPos = rect.bottom + 10
    let rightPos = (window.innerWidth - rect.right) + 15
    
    const minRightMargin = 16
    if (rightPos < minRightMargin) rightPos = minRightMargin
    
    const estimatedHeight = 200
    const maxBottom = window.innerHeight - 16
    if (topPos + estimatedHeight > maxBottom) {
      topPos = maxBottom - estimatedHeight
    }

    logoutDialogPos.value = {
      top: `${topPos}px`,
      right: `${rightPos}px`
    }
  } else {
    logoutDialogPos.value = { top: '80px', right: '20px' }
  }

  showLogoutDialog.value = true
}

const confirmLogout = () => {
  showLogoutDialog.value = false
  navigateTo('/')
}
</script>

<template>
  <div class="owner-settings-page">
    
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ t('pages.owner.settings.title') }}</h1>
      
      <div class="header-actions">
        <!-- Toggle Theme -->
        <div class="theme-icon-wrapper" :title="themeIcon === 'material-symbols:dark-mode-rounded' ? t('ui.theme_dark') : t('ui.theme_light')" @click="toggleTheme">
          <Icon :name="themeIcon" size="24" class="theme-icon" />
        </div>
        
        <!-- Logout Button -->
        <div 
          ref="logoutBtnRef" 
          class="logout-icon-wrapper" 
          :title="t('pages.finance.profile.logout')" 
          @click="openLogoutDialog"
        >
          <Icon name="material-symbols:logout-rounded" size="24" class="logout-icon" />
        </div>
      </div>
    </div>

    <!-- Section: Aplikasi -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.owner.settings.app') }}</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:info-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.owner.settings.app_name') }}</span>
            <span class="item-desc">ROut</span>
          </div>
        </div>
        
        <div class="divider"></div>

        <div class="settings-item">
          <Icon name="material-symbols:update-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.owner.settings.app_version') }}</span>
            <span class="item-desc">1.0.0</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Konfigurasi Sistem -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.owner.settings.system') }}</h2>
      <div class="settings-card">
        
        <!-- Dropdown Tombol Pusat -->
        <div class="settings-item dropdown-item" :class="{ 'z-active': isDropdownOpen }">
          <Icon name="material-symbols:dashboard-customize-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('ui.center_button') }}</span>
            <span class="item-desc">{{ t('pages.owner.settings.center_button_desc') }}</span>
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
            <span class="item-label">{{ t('ui.language') }}</span>
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

    <!-- Section: Keamanan -->
    <div class="settings-section">
      <h2 class="section-title">{{ t('pages.owner.settings.security') }}</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:lock-reset-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">{{ t('pages.owner.settings.reset_security') }}</span>
            <span class="item-desc">{{ t('pages.owner.settings.reset_security_desc') }}</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Overlay dropdown -->
    <div v-if="isDropdownOpen || isLangDropdownOpen" class="dropdown-overlay" @click="closeAllDropdowns"></div>

    <!-- Dialog Logout -->
    <SharedConfirmDialog
      v-if="showLogoutDialog"
      positioned
      :style="{ '--dialog-top': logoutDialogPos.top, '--dialog-right': logoutDialogPos.right }"
      :title="t('pages.owner.settings.logout_dialog.title')"
      :message="t('pages.owner.settings.logout_dialog.message')"
      :confirmText="t('pages.owner.settings.logout_dialog.confirm')"
      :cancelText="t('ui.cancel')"
      @confirm="confirmLogout"
      @cancel="showLogoutDialog = false"
    />
  </div>
</template>

<style scoped>
.owner-settings-page { padding: 40px 20px; color: var(--md-sys-color-on-surface); position: relative; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.page-title { color: var(--md-sys-color-primary); margin: 0; font-size: 1.5rem; }
.header-actions { display: flex; align-items: center; gap: 10px; }
.theme-icon-wrapper, .logout-icon-wrapper { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); cursor: pointer; transition: var(--transition); }
.theme-icon-wrapper:hover, .logout-icon-wrapper:hover { background-color: var(--md-sys-color-surface-variant); }
.theme-icon { color: var(--md-sys-color-primary); }
.logout-icon { color: var(--md-sys-color-error); }
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
.dropdown-list { position: absolute; top: calc(100% + 8px); right: 0; width: 180px; background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px; box-shadow: var(--shadow-lg); overflow: hidden; z-index: 50; }
.dropdown-list.dropdown-above { top: auto; bottom: calc(100% + 8px); }
.dropdown-option { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; font-size: 0.9rem; cursor: pointer; color: var(--md-sys-color-on-surface); transition: background-color 0.2s; }
.dropdown-option:hover { background-color: var(--md-sys-color-surface-variant); }
.dropdown-option.active { color: var(--md-sys-color-primary); font-weight: 600; background-color: var(--md-sys-color-primary-container); }
.dropdown-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10; background-color: transparent; }
</style>

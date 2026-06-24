<script setup>
import { ref } from 'vue'

const showLogoutDialog = ref(false)
const confirmLogout = () => {
  showLogoutDialog.value = false
  navigateTo('/')
}

// State untuk Dropdown Tombol Pusat
const selectedMenu = useState('navFinanceCenter', () => 'analytics')
const isDropdownOpen = ref(false)

const menuOptions = [
  { value: 'analytics', label: 'Analytics' },
  { value: 'debt', label: 'Debt' },
  { value: 'pencatat', label: 'Pencatat' }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const selectOption = (value) => {
  selectedMenu.value = value
  isDropdownOpen.value = false
}
</script>

<template>
  <div class="finance-profile-page">
    
    <!-- Header dengan Tombol Keluar -->
    <div class="page-header">
      <h1 class="page-title">Profile Finance</h1>
      
      <button class="logout-icon-wrapper" title="Keluar" @click="showLogoutDialog = true">
        <Icon name="material-symbols:logout-rounded" size="24" class="logout-icon" />
      </button>
    </div>

    <!-- Kartu User Sederhana -->
    <div class="profile-card">
      <Icon name="material-symbols:account-circle-rounded" size="64" class="profile-avatar" />
      <h2>Guest User</h2>
      <p>guest@finance.com</p>
    </div>

    <!-- Section: Tampilan (Dropdown) -->
    <div class="menu-section">
      <h2 class="section-title">Tampilan</h2>
      <div class="menu-card">
        <div class="menu-item dropdown-item">
          <Icon name="material-symbols:shortcuts-rounded" size="24" class="menu-icon" />
          <div class="menu-text">
            <span class="menu-label">Tombol Pusat</span>
            <span class="menu-desc">Ubah menu di tombol tengah</span>
          </div>
          
          <div class="custom-dropdown">
            <button class="dropdown-trigger" @click="toggleDropdown">
              <span>{{ menuOptions.find(opt => opt.value === selectedMenu)?.label }}</span>
              <Icon 
                name="material-symbols:arrow-drop-down-rounded" 
                size="20" 
                class="dropdown-arrow"
                :class="{ 'rotate': isDropdownOpen }"
              />
            </button>

            <div v-if="isDropdownOpen" class="dropdown-list">
              <div 
                v-for="option in menuOptions" 
                :key="option.value"
                class="dropdown-option"
                :class="{ 'active': selectedMenu === option.value }"
                @click="selectOption(option.value)"
              >
                {{ option.label }}
                <Icon v-if="selectedMenu === option.value" name="material-symbols:check-rounded" size="18" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Menu Lainnya -->
    <div class="menu-section">
      <h2 class="section-title">Menu</h2>
      <div class="menu-card">
        <div class="menu-item">
          <Icon name="material-symbols:settings-rounded" size="24" class="menu-icon" />
          <div class="menu-text">
            <span class="menu-label">Pengaturan Akun</span>
            <span class="menu-desc">Ubah keamanan dan profil</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Overlay untuk menutup dropdown jika klik area lain -->
    <div v-if="isDropdownOpen" class="dropdown-overlay" @click="isDropdownOpen = false"></div>

    <!-- KOMPONEN DIALOG KELUAR -->
    <ConfirmDialog 
      v-if="showLogoutDialog"
      title="Keluar dari Finance?"
      message="Anda akan diarahkan kembali ke halaman utama."
      confirmText="Ya, Keluar"
      cancelText="Batal"
      @confirm="confirmLogout"
      @cancel="showLogoutDialog = false"
    />

  </div>
</template>

<style scoped>
.finance-profile-page {
  padding: 40px 20px;
  color: var(--md-sys-color-on-surface);
  position: relative;
}

/* === STYLE HEADER & TOMBOL KELUAR === */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  color: var(--md-sys-color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.logout-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  cursor: pointer;
  transition: var(--transition);
}

.logout-icon-wrapper:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.logout-icon {
  color: var(--md-sys-color-error);
}

/* === STYLE KARTU PROFILE === */
.profile-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-bottom: 32px;
}

.profile-avatar {
  color: var(--md-sys-color-primary);
  margin-bottom: 8px;
}

.profile-card h2 {
  margin: 8px 0 4px;
  font-size: 1.2rem;
}

.profile-card p {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

/* === STYLE MENU === */
.menu-section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 8px;
  padding-left: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-card {
  background-color: var(--md-sys-color-surface-container);
  border-radius: 16px;
  border: 1px solid var(--md-sys-color-outline-variant);
  /* overflow: hidden; DIHAPUS agar dropdown bisa keluar dari kotak */
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* Tambahan agar sudut tetap rapi saat hover karena overflow dihilangkan */
.menu-item:first-child {
  border-radius: 16px 16px 0 0;
}
.menu-item:last-child {
  border-radius: 0 0 16px 16px;
}
.menu-item:only-child {
  border-radius: 16px;
}

.menu-item:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.menu-icon {
  color: var(--md-sys-color-primary);
  margin-right: 16px;
}

.menu-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
  margin-right: 16px;
}

.menu-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}

.menu-desc {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
}

.chevron {
  color: var(--md-sys-color-on-surface-variant);
}

/* === STYLE CUSTOM DROPDOWN === */
.dropdown-item {
  cursor: default;
}

.custom-dropdown {
  position: relative;
  z-index: 20;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 140px;
  gap: 4px;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: var(--transition);
}

.dropdown-trigger:hover {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-secondary-container);
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}
.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 180px;
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 50;
}

.dropdown-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s;
}

.dropdown-option:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.dropdown-option.active {
  color: var(--md-sys-color-primary);
  font-weight: 600;
  background-color: var(--md-sys-color-primary-container);
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  background-color: transparent;
}

/* =========================================
   STYLE DIALOG DARI HALAMAN INI
   ========================================= */
:deep(.dialog-overlay) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-start; 
  justify-content: flex-end;
  padding: 90px 40px 20px 20px; 
  animation: fadeIn 0.2s ease;
}

:deep(.dialog-box) {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  padding: 20px;
  margin-right: 35px;
  width: 100%;
  max-width: 300px;
  box-shadow: var(--shadow-lg);
  animation: slideDown 0.2s ease;
}

:deep(.dialog-title) {
  margin: 0 0 8px;
  font-size: 1.1rem;
  text-align: center;
  color: var(--md-sys-color-on-surface);
}

:deep(.dialog-message) {
  margin: 0 0 20px;
  font-size: 0.9rem;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
}

:deep(.dialog-actions) {
  display: flex;
  justify-content: center;
  gap: 10px;
}

:deep(.dialog-btn) {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 14px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.cancel-btn) {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}

:deep(.cancel-btn:hover) {
  background-color: var(--md-sys-color-outline-variant);
}

:deep(.confirm-btn) {
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

:deep(.confirm-btn:hover) {
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
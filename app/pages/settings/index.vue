<script setup>
import { ref } from 'vue'

// State untuk menyimpan pilihan dan status buka/tutup dropdown
const selectedMenu = useState('navCenterMenu', () => 'running-man')
const isDropdownOpen = ref(false)

// Daftar pilihan menu
const menuOptions = [
  { value: 'running-man', label: 'Running Man' },
  { value: 'finance', label: 'Finance' }
]

// Fungsi untuk membuka/menutup dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Fungsi saat memilih salah satu item
const selectOption = (value) => {
  selectedMenu.value = value
  isDropdownOpen.value = false
}
</script>

<template>
  <div class="settings-page">
    
    <!-- Header dengan Judul dan Ikon Pojok Kanan -->
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      
      <div class="theme-icon-wrapper">
        <Icon name="material-symbols:dark-mode-rounded" size="24" class="theme-icon" />
      </div>
    </div>

    <!-- Section: Akun -->
    <div class="settings-section">
      <h2 class="section-title">Akun</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:person-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">Edit Profil</span>
            <span class="item-desc">Ubah nama, email, dan foto</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
        
        <div class="divider"></div>

        <div class="settings-item">
          <Icon name="material-symbols:lock-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">Keamanan</span>
            <span class="item-desc">Password dan verifikasi 2 langkah</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Section: Tampila (CUSTOM DROPDOWN DI SINI) -->
    <div class="settings-section">
      <h2 class="section-title">Tampilan</h2>
      <div class="settings-card">
        <div class="settings-item dropdown-item">
          <Icon name="material-symbols:dashboard-customize-rounded" size="24" class="item-icon" />
          
          <div class="item-text">
            <span class="item-label">Tombol Pusat</span>
            <span class="item-desc">Ubah menu di tombol tengah</span>
          </div>
          
          <!-- Custom Dropdown Wrapper -->
          <div class="custom-dropdown">
            <!-- Tombol Pemicu (Trigger) -->
            <button class="dropdown-trigger" @click="toggleDropdown">
              <span>{{ menuOptions.find(opt => opt.value === selectedMenu)?.label }}</span>
              <Icon 
                name="material-symbols:arrow-drop-down-rounded" 
                size="20" 
                class="dropdown-arrow"
                :class="{ 'rotate': isDropdownOpen }"
              />
            </button>

            <!-- Daftar Pilihan (Muncul ke bawah) -->
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

    <!-- Section: Lainnya -->
    <div class="settings-section">
      <h2 class="section-title">Lainnya</h2>
      <div class="settings-card">
        <div class="settings-item">
          <Icon name="material-symbols:info-rounded" size="24" class="item-icon" />
          <div class="item-text">
            <span class="item-label">Tentang Aplikasi</span>
            <span class="item-desc">Versi 1.0.0</span>
          </div>
          <Icon name="material-symbols:chevron-right-rounded" size="24" class="chevron" />
        </div>
      </div>
    </div>

    <!-- Overlay transparan untuk menutup dropdown jika klik area lain -->
    <div v-if="isDropdownOpen" class="dropdown-overlay" @click="isDropdownOpen = false"></div>

  </div>
</template>

<style scoped>
.settings-page {
  padding: 40px 20px;
  color: var(--md-sys-color-on-surface);
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  color: var(--md-sys-color-primary);
  margin: 0;
  font-size: 1.5rem;
}

.theme-icon-wrapper {
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

.theme-icon-wrapper:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.theme-icon {
  color: var(--md-sys-color-primary);
}

.settings-section {
  margin-bottom: 28px;
  position: relative;
}

.section-title {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 8px;
  padding-left: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-card {
  background-color: var(--md-sys-color-surface-container);
  border-radius: 16px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.settings-item:first-child {
  border-radius: 16px 16px 0 0;
}
.settings-item:last-child {
  border-radius: 0 0 16px 16px;
}
.settings-item:only-child {
  border-radius: 16px;
}

.settings-item:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.item-icon {
  color: var(--md-sys-color-primary);
  margin-right: 16px;
}

.item-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
  margin-right: 16px;
}

.item-label {
  font-size: 0.95rem;
  font-weight: 500;
}

.item-desc {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
}

.chevron {
  color: var(--md-sys-color-on-surface-variant);
}

.divider {
  height: 1px;
  background-color: var(--md-sys-color-outline-variant);
  margin: 0 20px;
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
  justify-content: space-between; /* Tambahkan ini agar teks dan ikon menjauh */
  width: 140px; /* Tambahkan ini agar ukurannya tetap */
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
</style>
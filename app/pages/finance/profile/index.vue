<script setup>
import { ref } from 'vue'

// State untuk menampilkan/menyembunyikan dialog
const showLogoutDialog = ref(false)

// Fungsi saat tombol "Ya" diklik di dialog
const confirmLogout = () => {
  showLogoutDialog.value = false // Tutup dialog
  navigateTo('/') // Pindah ke halaman utama
}
</script>

<template>
  <div class="finance-profile-page">
    
    <!-- Header dengan Tombol Keluar -->
    <div class="page-header">
      <h1 class="page-title">Profile Finance</h1>
      
      <!-- Tombol ini hanya memunculkan dialog, tidak langsung pindah halaman -->
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

    <!-- Menu Pengaturan Finance -->
    <div class="menu-section">
      <h2 class="section-title">Menu</h2>
      <div class="menu-card">
        <!-- Menu Pengaturan Akun -->
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

    <!-- PANGGIL KOMPONEN DIALOG REUSABLE DI SINI -->
    <ConfirmDialog 
      v-if="showLogoutDialog"
      title="Keluar dari Finance?"
      message="Anda akan diarahkan kembali ke halaman utama."
      confirmText="Iya"
      cancelText="Batal"
      @confirm="confirmLogout"
      @cancel="showLogoutDialog = false"
    />

  </div>
</template>

<style scoped>
/* === STYLE HALAMAN PROFILE === */
.finance-profile-page {
  padding: 40px 20px;
  color: var(--md-sys-color-on-surface);
}

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
  overflow: hidden;
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


/* =========================================
   STYLE DIALOG DARI HALAMAN INI (DROPDOWN STYLE)
   ========================================= */

/* Background gelap transparan (TANPA BLUR) */
:deep(.dialog-overlay) {
  position: fixed; /* WAJIB ADA INI agar melayang */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0, 0, 0.5);
  z-index: 9999;
  
  /* Posisi kanan atas */
  display: flex;
  align-items: flex-start; 
  justify-content: flex-end;
  
  /* Atur jarak: 90px dari atas, 40px dari kanan, 20px dari bawah/kiri */
  padding: 90px 40px 20px 20px; 
  animation: fadeIn 0.2s ease;
}

/* Kotak Dialog */
:deep(.dialog-box) {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  margin-right: 35px;
  max-width: 300px;
  box-shadow: var(--shadow-lg);
  animation: slideDown 0.2s ease;
  /* Hapus margin-right jika sebelumnya ditambahkan, biarkan padding di overlay yang mengatur */
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

/* Animasi */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Jarak turun lebih kecil agar terasa seperti dropdown */
@keyframes slideDown {
  from { transform: translateY(-15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
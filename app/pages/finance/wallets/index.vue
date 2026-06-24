<script setup>
import { ref } from 'vue'

// State daftar dompet (Hanya 1 default, tanpa dummy palsu)
const wallets = ref([
  { id: 1, name: 'Dompet Utama', type: 'Cash', balance: 0, isDefault: true, icon: 'mdi:wallet' }
])

// State untuk UI
const activeMenuId = ref(null)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const isBalanceHidden = ref(false) // State untuk hide/show saldo

// State data form
const isEditing = ref(false)
const formData = ref({ id: null, name: '' })

// State data hapus & Posisi Dialog
const walletToDelete = ref(null)
const dialogPosition = ref({ top: '0px', right: '20px' })

// Format Rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

// Fungsi untuk mengubah angka menjadi x (misal: Rp 1.500.000 -> Rp x.xxx.xxx)
const getDisplayBalance = (value) => {
  if (isBalanceHidden.value) {
    const formatted = formatRupiah(value)
    // Ganti semua angka dengan 'x', biarkan titik dan "Rp "
    return formatted.replace(/[0-9]/g, 'x')
  }
  return formatRupiah(value)
}

// Fungsi toggle hide/show
const toggleBalanceVisibility = () => {
  isBalanceHidden.value = !isBalanceHidden.value
}

// === LOGIC MENU TITIK TIGA ===
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

// === LOGIC TAMBAH DOMPET ===
const openAddDialog = () => {
  isEditing.value = false
  formData.value = { id: null, name: '' }
  showFormDialog.value = true
}

// === LOGIC UBAH NAMA (RENAME) ===
const openRenameDialog = (wallet) => {
  isEditing.value = true
  formData.value = { id: wallet.id, name: wallet.name }
  activeMenuId.value = null
  showFormDialog.value = true
}

// Simpan Form (Tambah / Rename)
const saveWallet = () => {
  if (!formData.value.name.trim()) return

  if (isEditing.value) {
    const wallet = wallets.value.find(w => w.id === formData.value.id)
    if (wallet) wallet.name = formData.value.name
  } else {
    const newId = Date.now()
    wallets.value.push({
      id: newId,
      name: formData.value.name,
      type: 'Cash',
      balance: 0,
      isDefault: false,
      icon: 'mdi:wallet'
    })
  }
  showFormDialog.value = false
}

// === LOGIC JADIKAN DEFAULT ===
const setAsDefault = (id) => {
  wallets.value.forEach(w => w.isDefault = (w.id === id))
  activeMenuId.value = null
}

// === LOGIC HAPUS DOMPET (DENGAN POSISI DINAMIS) ===
const openDeleteDialog = (wallet, event) => {
  if (wallet.isDefault) {
    alert('Dompet default tidak bisa dihapus!')
    activeMenuId.value = null
    return
  }

  // Tangkap posisi tombol yang diklik
  const buttonRect = event.target.getBoundingClientRect()
  const rightPosition = window.innerWidth - buttonRect.right

  // Simpan posisinya (di bawah tombol + jarak 10px)
  dialogPosition.value = {
    top: `${buttonRect.bottom + 10}px`,
    right: `${rightPosition}px`
  }

  walletToDelete.value = wallet
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  wallets.value = wallets.value.filter(w => w.id !== walletToDelete.value.id)
  showDeleteDialog.value = false
  walletToDelete.value = null
  activeMenuId.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  activeMenuId.value = null
}
</script>

<template>
  <div class="wallets-page">
    <div class="page-header">
      <h1 class="page-title">Dompet</h1>
      <button class="add-icon-wrapper" title="Tambah Dompet" @click="openAddDialog">
        <Icon name="mdi:plus" size="24" class="add-icon" />
      </button>
    </div>

    <!-- Daftar Kartu Dompet -->
    <div v-for="wallet in wallets" :key="wallet.id" class="wallet-card">
      
      <!-- Menu Titik Tiga (Dropdown) -->
      <div class="card-menu-wrapper">
        <button class="menu-btn" @click="toggleMenu(wallet.id)">
          <Icon name="mdi:dots-vertical" size="20" />
        </button>
        
        <template v-if="activeMenuId === wallet.id">
          <!-- Dropdown Menu -->
          <div class="dropdown-menu">
            <div class="dropdown-item" @click="openRenameDialog(wallet)">
              <Icon name="mdi:pencil" size="18" />
              <span>Ubah Nama</span>
            </div>
            <div class="dropdown-item" @click="setAsDefault(wallet.id)" v-if="!wallet.isDefault">
              <Icon name="mdi:star" size="18" />
              <span>Jadikan Default</span>
            </div>
            <!-- Tombol hapus hanya muncul jika BUKAN dompet default -->
            <div v-if="!wallet.isDefault" class="dropdown-item text-danger" @click="openDeleteDialog(wallet, $event)">
              <Icon name="mdi:trash-can-outline" size="18" />
              <span>Hapus</span>
            </div>
          </div>
          
          <!-- Overlay lokal agar tidak bentrok dengan klik menu -->
          <div class="menu-overlay" @click="activeMenuId = null"></div>
        </template>
      </div>

      <div class="wallet-top">
        <div class="wallet-icon-bg">
          <Icon :name="wallet.icon" size="28" class="wallet-icon" />
        </div>
        <div class="wallet-info">
          <span class="wallet-name">
            {{ wallet.name }}
            <Icon v-if="wallet.isDefault" name="mdi:star" size="16" class="default-star" />
          </span>
          <span class="wallet-type">{{ wallet.type }}</span>
        </div>
      </div>

      <div class="wallet-balance-section">
        <div class="balance-header">
          <span class="balance-label">Saldo</span>
          <!-- Tombol Mata (Hide/Show) -->
          <button class="eye-btn" @click="toggleBalanceVisibility">
            <Icon :name="isBalanceHidden ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" size="20" />
          </button>
        </div>
        <h2 class="balance-amount">{{ getDisplayBalance(wallet.balance) }}</h2>
      </div>
    </div>

    <!-- FORM MODAL (TAMBAH / UBAH NAMA) -->
    <div v-if="showFormDialog" class="form-overlay">
      <div class="form-box">
        <h3 class="form-title">{{ isEditing ? 'Ubah Nama Dompet' : 'Tambah Dompet Baru' }}</h3>
        
        <form @submit.prevent="saveWallet">
          <input 
            type="text" 
            v-model="formData.name" 
            class="form-input" 
            placeholder="Masukkan nama dompet"
            autofocus
          />
          <div class="form-actions">
            <button type="button" class="form-btn cancel" @click="showFormDialog = false">Batal</button>
            <button type="submit" class="form-btn save">Simpan</button>
          </div>
        </form>

      </div>
    </div>

    <!-- KOMPONEN KONFIRMASI HAPUS -->
    <ConfirmDialog 
      v-if="showDeleteDialog"
      :style="{ '--dialog-top': dialogPosition.top, '--dialog-right': dialogPosition.right }"
      title="Hapus Dompet?"
      message="Apakah Anda yakin ingin menghapus dompet ini? Semua riwayat transaksi terkait mungkin terpengaruh."
      confirmText="Ya, Hapus"
      cancelText="Batal"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>

<style scoped>
.wallets-page {
  padding: 40px 20px;
  color: var(--md-sys-color-on-surface);
  position: relative;
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

.add-icon-wrapper {
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

.add-icon-wrapper:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.add-icon {
  color: var(--md-sys-color-primary);
}

/* === KARTU DOMPET (ELEGAN & MINIMALIS) === */
.wallet-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 20px;
  position: relative;
  transition: transform 0.2s ease;
}

.wallet-card:hover {
  transform: translateY(-2px);
}

/* === MENU DROPDOWN TITIK TIGA === */
.card-menu-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s;
  position: relative;
  z-index: 1002;
}

.menu-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.dropdown-menu {
  position: absolute;
  top: 32px;
  right: 0;
  width: 180px;
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1002;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.text-danger {
  color: var(--md-sys-color-error);
}

.menu-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1001;
  background-color: transparent;
}

/* === DETAIL KARTU === */
.wallet-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.wallet-icon-bg {
  width: 48px;
  height: 48px;
  background-color: var(--md-sys-color-primary-container);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon {
  color: var(--md-sys-color-on-primary-container);
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.wallet-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  display: flex;
  align-items: center;
  gap: 4px;
}

.default-star {
  color: #FFD700;
}

.wallet-type {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
}

.wallet-balance-section {
  margin-bottom: 8px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.balance-label {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  display: block;
}

.eye-btn {
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s;
}

.eye-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.balance-amount {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--md-sys-color-primary);
  letter-spacing: -0.5px;
}

/* === FORM MODAL (TAMBAH/UBAH) === */
.form-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s;
}

.form-box {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 28px;
  padding: 28px 24px 20px;
  width: 100%;
  max-width: 360px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.form-title {
  margin: 0 0 20px;
  font-size: 1.2rem;
  color: var(--md-sys-color-on-surface);
  text-align: center;
}

.form-input {
  width: 100%;
  padding: 16px;
  font-size: 1rem;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  color: var(--md-sys-color-on-surface);
  outline: none;
  margin-bottom: 24px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--md-sys-color-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.form-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.form-btn.cancel {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.form-btn.save {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

/* =========================================
   STYLE DIALOG KONFIRMASI HAPUS (DINAMIS)
   ========================================= */
:deep(.dialog-overlay) {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

:deep(.dialog-box) {
  position: absolute;
  top: var(--dialog-top, 50%);
  right: var(--dialog-right, 20px);
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  padding: 20px;
  width: 280px;
  max-width: calc(100vw - 40px);
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
  font-size: 0.85rem;
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
  font-size: 0.85rem;
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

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
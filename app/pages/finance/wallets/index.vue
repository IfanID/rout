<script setup>
import { ref, onMounted } from 'vue'

const { t } = useI18n()

// === STATE LOADING SKELETON ===
const isBalanceLoading = ref(true)

// State daftar dompet (Sudah dihapus Bank BCA, sisakan default saja)
const wallets = ref([
  { id: 1, name: t('pages.finance.wallets.default_name'), type: 'Cash', balance: 0, isDefault: true, icon: 'mdi:wallet' }
])

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)

const isBalanceHidden = useBalanceVisibility()

const menuCloseTrigger = ref(0)

const isEditing = ref(false)
const formData = ref({ id: null, name: '' })

const walletToDelete = ref(null)
const dialogPosition = ref({ top: '0px', right: '20px' })

// === LOGIC TAMBAH DOMPET ===
const openAddDialog = () => {
  isEditing.value = false
  formData.value = { id: null, name: '' }
  showFormDialog.value = true
}

const openRenameDialog = (wallet) => {
  isEditing.value = true
  formData.value = { id: wallet.id, name: wallet.name }
  showFormDialog.value = true
}

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

const setAsDefault = (id) => {
  wallets.value.forEach(w => w.isDefault = (w.id === id))
}

const openDeleteDialog = (wallet, event) => {
  if (wallet.isDefault) {
    alert(t('pages.finance.wallets.dialog.cannot_delete_default'))
    return
  }

  const buttonRect = event.currentTarget.getBoundingClientRect()
  const rightPosition = window.innerWidth - buttonRect.right

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
  menuCloseTrigger.value++
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  menuCloseTrigger.value++
}

// === SIMULASI LOADING ===
onMounted(() => {
  setTimeout(() => {
    isBalanceLoading.value = false
  }, 1500)
})
</script>

<template>
  <div class="wallets-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('pages.finance.wallets.title') }}</h1>
      <button class="add-icon-wrapper" :title="t('pages.finance.wallets.add')" @click="openAddDialog">
        <Icon name="mdi:plus" size="24" class="add-icon" />
      </button>
    </div>

    <FinanceWalletCard 
      v-for="wallet in wallets" 
      :key="wallet.id" 
      :wallet="wallet" 
      :is-balance-hidden="isBalanceHidden"
      :is-balance-loading="isBalanceLoading"
      :close-trigger="menuCloseTrigger"
      @toggle-hide="isBalanceHidden = !isBalanceHidden"
      @rename="openRenameDialog"
      @set-default="setAsDefault"
      @delete="openDeleteDialog"
    />

    <!-- FORM MODAL (TAMBAH / UBAH NAMA) -->
    <div v-if="showFormDialog" class="form-overlay">
      <div class="form-box">
        <h3 class="form-title">{{ isEditing ? t('pages.finance.wallets.dialog.rename_title') : t('pages.finance.wallets.dialog.add_title') }}</h3>
        
        <form @submit.prevent="saveWallet">
          <input 
            type="text" 
            v-model="formData.name" 
            class="form-input" 
            :placeholder="t('pages.finance.wallets.dialog.name_placeholder')"
            autofocus
          />
          <div class="form-actions">
            <button type="button" class="form-btn cancel" @click="showFormDialog = false">{{ t('pages.finance.wallets.dialog.cancel') }}</button>
            <button type="submit" class="form-btn save">{{ t('pages.finance.wallets.dialog.save') }}</button>
          </div>
        </form>

      </div>
    </div>

    <!-- KOMPONEN KONFIRMASI HAPUS -->
    <ConfirmDialog 
      v-if="showDeleteDialog"
      positioned
      :style="{ '--dialog-top': dialogPosition.top, '--dialog-right': dialogPosition.right }"
      :title="t('pages.finance.wallets.dialog.delete_title')"
      :message="t('pages.finance.wallets.dialog.delete_message')"
      :confirmText="t('pages.finance.wallets.dialog.delete_confirm')"
      :cancelText="t('pages.finance.wallets.dialog.cancel')"
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
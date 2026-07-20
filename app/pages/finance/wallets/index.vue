<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { walletTypes } from '~/composables/useFinanceStore'

const { t } = useI18n()
const {
  wallets,
  getWalletBalance,
  addWallet,
  renameWallet,
  changeWalletType,
  deleteWallet,
  setDefaultWallet
} = useFinanceStore()

const isBalanceLoading = ref(true)
const isMounted = ref(false)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const isBalanceHidden = useBalanceVisibility()
const menuCloseTrigger = ref(0)

const dialogMode = ref('add')
const formData = ref({ id: null, name: '', type: 'Cash' })
const walletToDelete = ref(null)
const dialogPosition = ref({ top: '0px', right: '20px' })

const isTypeDropdownOpen = ref(false)
const typeDropdownRef = ref(null)
const isTypeDropdownAbove = ref(false)

const walletsDisplay = computed(() => {
  return wallets.value.map(w => ({
    id: w.id,
    name: w.name,
    type: w.type,
    isDefault: w.isDefault,
    balance: getWalletBalance(w.id)
  }))
})

const selectedTypeLabel = computed(() => {
  const found = walletTypes.find(t => t.value === formData.value.type)
  return found ? found.label : 'Cash'
})

const openAddDialog = () => {
  dialogMode.value = 'add'
  formData.value = { id: null, name: '', type: 'Cash' }
  showFormDialog.value = true
}

const openEditNameDialog = (wallet) => {
  dialogMode.value = 'name'
  formData.value = { id: wallet.id, name: wallet.name, type: wallet.type }
  showFormDialog.value = true
}

const openChangeTypeDialog = (wallet) => {
  dialogMode.value = 'type'
  formData.value = { id: wallet.id, name: wallet.name, type: wallet.type }
  showFormDialog.value = true
}

const toggleTypeDropdown = () => {
  isTypeDropdownOpen.value = !isTypeDropdownOpen.value
  if (isTypeDropdownOpen.value) {
    nextTick(() => {
      if (typeDropdownRef.value) {
        const rect = typeDropdownRef.value.getBoundingClientRect()
        isTypeDropdownAbove.value = rect.bottom > window.innerHeight - 8
      }
    })
  }
}

const selectType = (value) => {
  formData.value.type = value
  isTypeDropdownOpen.value = false
}

const saveWallet = () => {
  if (dialogMode.value === 'type') {
    changeWalletType(formData.value.id, formData.value.type)
  } else if (dialogMode.value === 'name') {
    if (!formData.value.name.trim()) return
    renameWallet(formData.value.id, formData.value.name)
  } else {
    if (!formData.value.name.trim()) return
    addWallet(formData.value.name, formData.value.type)
  }
  showFormDialog.value = false
}

const openDeleteDialog = (wallet, event) => {
  if (wallet.isDefault) {
    alert(t('pages.finance.wallets.dialog.cannot_delete_default'))
    return
  }

  const buttonRect = event.currentTarget.getBoundingClientRect()
  const rightPosition = window.innerWidth - buttonRect.right

  dialogPosition.value = {
    top: buttonRect.bottom + 10 + 'px',
    right: rightPosition + 'px'
  }

  walletToDelete.value = wallet
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  deleteWallet(walletToDelete.value.id)
  showDeleteDialog.value = false
  walletToDelete.value = null
  menuCloseTrigger.value++
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  menuCloseTrigger.value++
}

onMounted(() => {
  nextTick(() => {
    isMounted.value = true
    isBalanceLoading.value = false
  })
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

    <template v-if="isMounted">
      <FinanceWalletCard
        v-for="wallet in walletsDisplay"
        :key="wallet.id"
        :wallet="wallet"
        :is-balance-hidden="isBalanceHidden"
        :is-balance-loading="isBalanceLoading"
        :close-trigger="menuCloseTrigger"
        @toggle-hide="isBalanceHidden = !isBalanceHidden"
        @rename="openEditNameDialog"
        @change-type="openChangeTypeDialog"
        @set-default="setDefaultWallet"
        @delete="openDeleteDialog"
      />
    </template>

    <template v-else>
      <div
        v-for="i in Math.max(walletsDisplay.length, 1)"
        :key="'skel-' + i"
        class="wallet-skeleton"
      >
        <div class="skel-header">
          <div class="skel-icon"></div>
          <div class="skel-texts">
            <div class="skel-line skel-line--name"></div>
            <div class="skel-line skel-line--type"></div>
          </div>
        </div>
        <div class="skel-balance">
          <div class="skel-line skel-line--balance"></div>
        </div>
      </div>
    </template>

    <div v-if="showFormDialog" class="form-overlay" @click.self="showFormDialog = false">
      <div class="form-box" @click.stop>
        <h3 class="form-title">
          {{ dialogMode === 'type' ? t('pages.finance.wallets.dialog.change_type_title') : dialogMode === 'name' ? t('pages.finance.wallets.dialog.edit_name_title') : t('pages.finance.wallets.dialog.add_title') }}
        </h3>
        <form @submit.prevent="saveWallet">
          <input
            v-if="dialogMode !== 'type'"
            type="text"
            v-model="formData.name"
            class="form-input"
            :placeholder="t('pages.finance.wallets.dialog.name_placeholder')"
            autofocus
          />

          <div v-if="dialogMode !== 'name'" class="form-group">
            <label class="form-label">{{ t('pages.finance.wallets.dialog.type') }}</label>
            <div class="custom-dropdown">
              <button type="button" class="dropdown-trigger" @click="toggleTypeDropdown">
                <span>{{ selectedTypeLabel }}</span>
                <Icon
                  name="material-symbols:arrow-drop-down-rounded"
                  size="20"
                  class="dropdown-arrow"
                  :class="{ rotate: isTypeDropdownOpen }"
                />
              </button>
              <div
                v-if="isTypeDropdownOpen"
                ref="typeDropdownRef"
                class="dropdown-list"
                :class="{ 'dropdown-above': isTypeDropdownAbove }"
              >
                <div
                  v-for="type in walletTypes"
                  :key="type.value"
                  class="dropdown-option"
                  :class="{ active: formData.type === type.value }"
                  @click="selectType(type.value)"
                >
                  {{ type.label }}
                  <Icon
                    v-if="formData.type === type.value"
                    name="material-symbols:check-rounded"
                    size="18"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="form-btn cancel" @click="showFormDialog = false">
              {{ t('pages.finance.wallets.dialog.cancel') }}
            </button>
            <button type="submit" class="form-btn save">
              {{ t('pages.finance.wallets.dialog.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="isTypeDropdownOpen"
      class="dropdown-overlay"
      @click="isTypeDropdownOpen = false"
    ></div>

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
.wallet-skeleton {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.skel-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.skel-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}
.skel-texts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.skel-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-line--name {
  width: 40%;
}
.skel-line--type {
  width: 25%;
}
.skel-balance {
  padding-top: 8px;
}
.skel-line--balance {
  width: 60%;
  height: 28px;
  border-radius: 14px;
}
@keyframes skel-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  padding: 14px 16px;
  font-size: 1rem;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  color: var(--md-sys-color-on-surface);
  outline: none;
  margin-bottom: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--md-sys-color-primary);
}
.form-group {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 6px;
  padding-left: 4px;
  font-weight: 500;
}
.custom-dropdown {
  position: relative;
  z-index: 20;
}
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: var(--transition);
  font-family: inherit;
  box-sizing: border-box;
}
.dropdown-trigger:hover {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface);
}
.dropdown-arrow {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.dropdown-arrow.rotate {
  transform: rotate(180deg);
}
.dropdown-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 50;
}
.dropdown-list.dropdown-above {
  top: auto;
  bottom: calc(100% + 8px);
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
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 15;
  background-color: transparent;
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
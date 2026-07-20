<script setup>
import { ref, computed } from 'vue'
import { getWalletTypeInfo } from '~/composables/useFinanceStore'

const { t } = useI18n()
const {
  wallets,
  transactions,
  getWalletBalance,
  deleteWallet,
  deleteTransaction
} = useFinanceStore()
const { getCategoryById } = useFinanceCategories()

const isBalanceHidden = useBalanceVisibility()
const isMounted = ref(false)
const navCenterMenu = usePersistedState('navCenterMenu', 'running-man')
const navFinanceCenter = usePersistedState('navFinanceCenter', 'analytics')
const navOwnerCenter = usePersistedState('navOwnerCenter', 'dashboard')

const showDeleteAllDialog = ref(false)
const showTransactionsModal = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)
const fileInputRef = ref(null)

const dialogConfig = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Ya',
  cancelText: 'Batal',
  onConfirm: null
})

const walletList = computed(() => wallets.value || [])

const sortedTransactionList = computed(() => {
  return (transactions.value || []).slice().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

const getWalletName = (id) => {
  const w = walletList.value.find(w => w.id === id)
  return w ? w.name : '-'
}

const getWalletStats = (walletId) => {
  const txns = (transactions.value || []).filter(t => t.walletId === walletId)
  const income = txns.filter(t => t.type === 'income').length
  const expense = txns.filter(t => t.type === 'expense').length
  return { total: txns.length, income, expense }
}

const totalBalance = computed(() => {
  return walletList.value.reduce((sum, w) => sum + getWalletBalance(w.id), 0)
})

const formatRupiah = (n) => new Intl.NumberFormat('id-ID').format(n || 0)
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const showToast = (msg) => {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2500)
}

const openConfirmDialog = (title, message, onConfirm) => {
  dialogConfig.value = {
    show: true,
    title,
    message,
    confirmText: t('pages.owner.local_data.yes') || 'Ya',
    cancelText: t('pages.owner.local_data.cancel') || 'Batal',
    onConfirm
  }
}

const handleDeleteWallet = (wallet) => {
  if (wallet.isDefault) return showToast('Dompet default tidak bisa dihapus')
  openConfirmDialog(
    'Hapus Dompet?',
    `Hapus dompet "${wallet.name}"? Semua transaksi terkait juga akan dihapus.`,
    () => {
      deleteWallet(wallet.id)
      showToast('Dompet berhasil dihapus')
    }
  )
}

const handleDeleteTransaction = (trans) => {
  openConfirmDialog(
    'Hapus Transaksi?',
    'Hapus transaksi ini?',
    () => {
      deleteTransaction(trans.id)
      showToast('Transaksi dihapus')
    }
  )
}

const resetNavCenter = (key, defaultValue) => {
  if (key === 'navCenterMenu') navCenterMenu.value = defaultValue
  else if (key === 'navFinanceCenter') navFinanceCenter.value = defaultValue
  else if (key === 'navOwnerCenter') navOwnerCenter.value = defaultValue
  showToast('Pengaturan direset')
}

const deleteAll = () => {
  const keys = ['navCenterMenu', 'navFinanceCenter', 'navOwnerCenter', 'isBalanceHidden', 'financeWallets', 'financeTransactions']
  keys.forEach(key => localStorage.removeItem(key))
  showDeleteAllDialog.value = false
  showToast(t('pages.owner.local_data.delete_all_success'))
  setTimeout(() => window.location.reload(), 500)
}

const exportToJSON = () => {
  const data = {}
  const keys = ['navCenterMenu', 'navFinanceCenter', 'navOwnerCenter', 'isBalanceHidden', 'financeWallets', 'financeTransactions']
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value !== null) {
      try { data[key] = JSON.parse(value) }
      catch { data[key] = value }
    }
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rout-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast(t('pages.owner.local_data.export_success'))
}

const importFromJSON = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid')
      const validKeys = ['navCenterMenu', 'navFinanceCenter', 'navOwnerCenter', 'isBalanceHidden', 'financeWallets', 'financeTransactions']
      const keysToImport = Object.keys(data).filter(key => validKeys.includes(key))
      if (keysToImport.length === 0) return showToast(t('pages.owner.local_data.import_no_valid_keys'))
      openConfirmDialog(
        t('pages.owner.local_data.import_confirm_title') || 'Impor Data',
        t('pages.owner.local_data.import_confirm'),
        () => {
          keysToImport.forEach(key => {
            const value = data[key]
            const valueToStore = typeof value === 'object' ? JSON.stringify(value) : String(value)
            localStorage.setItem(key, valueToStore)
          })
          showToast(t('pages.owner.local_data.import_success'))
          setTimeout(() => window.location.reload(), 500)
        }
      )
    } catch (err) {
      showToast(t('pages.owner.local_data.import_error'))
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const triggerImport = () => fileInputRef.value?.click()

onMounted(() => {
  nextTick(() => {
    isMounted.value = true
  })
})
</script>

<template>
  <div class="local-data-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('pages.owner.local_data.title') }}</h1>
        <p class="page-subtitle">{{ t('pages.owner.local_data.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="triggerImport">
          <Icon name="material-symbols:upload-rounded" size="18" />
          <span class="btn-text-label">{{ t('pages.owner.local_data.import') }}</span>
        </button>
        <button class="btn-outline" @click="exportToJSON">
          <Icon name="material-symbols:download-rounded" size="18" />
          <span class="btn-text-label">{{ t('pages.owner.local_data.export') }}</span>
        </button>
        <button class="btn-danger" @click="showDeleteAllDialog = true">
          <Icon name="material-symbols:delete-sweep-rounded" size="18" />
          <span class="btn-text-label">{{ t('pages.owner.local_data.delete_all') }}</span>
        </button>
      </div>
      <input ref="fileInputRef" type="file" accept=".json" style="display: none" @change="importFromJSON" />
    </div>

    <div class="total-balance-bar">
      <div>
        <span class="total-label">Total Saldo</span>
        <span class="total-value">Rp {{ formatRupiah(totalBalance) }}</span>
      </div>
      <button class="btn-outline" @click="showTransactionsModal = true" v-if="sortedTransactionList.length > 0">
        <Icon name="material-symbols:receipt-long-outline" size="18" />
        <span class="btn-text-label">Data Transaksi</span>
      </button>
    </div>

    <!-- ========== SKELETON ========== -->
    <template v-if="!isMounted">
      <div class="section">
        <div class="skel-line skel-line--section-title"></div>
        <div class="wallet-grid">
          <div v-for="i in 2" :key="i" class="wallet-card skel-wallet-card">
            <div class="wallet-card-header">
              <div class="wallet-card-left">
                <div class="skel-icon-bg"></div>
                <div class="skel-texts">
                  <div class="skel-line skel-line--name"></div>
                  <div class="skel-line skel-line--type"></div>
                </div>
              </div>
              <div class="skel-icon-btn"></div>
            </div>
            <div class="skel-balance-row">
              <div class="skel-line skel-line--balance-label"></div>
              <div class="skel-line skel-line--balance"></div>
            </div>
            <div class="skel-stats-row">
              <div class="skel-line skel-line--stat"></div>
              <div class="skel-line skel-line--stat"></div>
              <div class="skel-line skel-line--stat"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="skel-line skel-line--section-title"></div>
        <div class="settings-card">
          <div v-for="i in 4" :key="i" class="setting-row">
            <div class="setting-info">
              <div class="skel-icon-sm"></div>
              <div class="skel-line skel-line--setting"></div>
            </div>
            <div class="skel-line skel-line--toggle"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== KONTEN ASLI ========== -->
    <template v-else>
      <div class="section">
        <h2 class="section-title">Dompet ({{ walletList.length }})</h2>
        <div class="wallet-grid">
          <div v-for="wallet in walletList" :key="wallet.id" class="wallet-card">
            <div class="wallet-card-header">
              <div class="wallet-card-left">
                <div class="wallet-icon-bg">
                  <Icon :name="getWalletTypeInfo(wallet.type).icon" size="24" />
                </div>
                <div>
                  <div class="wallet-card-name">
                    {{ wallet.name }}
                    <span v-if="wallet.isDefault" class="badge-default">Default</span>
                  </div>
                  <div class="wallet-card-type">{{ getWalletTypeInfo(wallet.type).label }}</div>
                </div>
              </div>
              <button
                class="icon-btn danger"
                :disabled="wallet.isDefault"
                :title="wallet.isDefault ? 'Default' : 'Hapus'"
                @click="handleDeleteWallet(wallet)"
              >
                <Icon name="material-symbols:delete-outline" size="20" />
              </button>
            </div>
            <div class="wallet-card-balance">
              <span class="balance-text">Saldo</span>
              <span class="balance-amount">Rp {{ formatRupiah(getWalletBalance(wallet.id)) }}</span>
            </div>
            <div class="wallet-card-stats">
              <div class="stat">
                <Icon name="material-symbols:receipt-long-outline" size="14" />
                <span>{{ getWalletStats(wallet.id).total }} transaksi</span>
              </div>
              <div class="stat income">
                <Icon name="material-symbols:arrow-downward" size="14" />
                <span>{{ getWalletStats(wallet.id).income }}</span>
              </div>
              <div class="stat expense">
                <Icon name="material-symbols:arrow-upward" size="14" />
                <span>{{ getWalletStats(wallet.id).expense }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="walletList.length === 0" class="empty-text">Belum ada dompet</div>
      </div>

      <div class="section">
        <h2 class="section-title">Pengaturan</h2>
        <div class="settings-card">
          <div class="setting-row">
            <div class="setting-info">
              <Icon name="material-symbols:visibility-off" size="24" />
              <span>Sembunyikan Saldo</span>
            </div>
            <div class="toggle-switch" :class="{ active: isBalanceHidden }" @click="isBalanceHidden = !isBalanceHidden">
              <div class="toggle-knob"></div>
            </div>
          </div>
          <div class="setting-row" v-for="(item, key) in { 'User': { key: 'navCenterMenu', val: navCenterMenu, def: 'running-man' }, 'Finance': { key: 'navFinanceCenter', val: navFinanceCenter, def: 'analytics' }, 'Owner': { key: 'navOwnerCenter', val: navOwnerCenter, def: 'dashboard' } }" :key="item.key">
            <div class="setting-info">
              <Icon name="material-symbols:dashboard-customize" size="24" />
              <span>Menu Tengah ({{ key }})</span>
            </div>
            <div class="setting-value">
              <span>{{ item.val }}</span>
              <button class="btn-text" @click="resetNavCenter(item.key, item.def)">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal Transaksi (selalu render, tidak perlu skeleton) -->
    <Teleport to="body">
      <div v-if="showTransactionsModal" class="modal-overlay" @click.self="showTransactionsModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>Data Transaksi ({{ sortedTransactionList.length }})</h3>
            <button class="close-btn" @click="showTransactionsModal = false">
              <Icon name="material-symbols:close-rounded" size="24" />
            </button>
          </div>
          <div class="modal-body">
            <div v-if="sortedTransactionList.length > 0" class="transaction-cards">
              <div v-for="trans in sortedTransactionList" :key="trans.id" class="trans-card">
                <div class="trans-card-left">
                  <div class="trans-icon" :style="{ backgroundColor: (getCategoryById(trans.categoryId)?.color || '#888') + '20' }">
                    <Icon :name="getCategoryById(trans.categoryId)?.icon || 'mdi:help-circle'" size="20" :style="{ color: getCategoryById(trans.categoryId)?.color || '#888' }" />
                  </div>
                  <div class="trans-info">
                    <div class="trans-desc">
                      {{ getCategoryById(trans.categoryId) ? t(getCategoryById(trans.categoryId).labelKey) : '-' }}
                    </div>
                    <div class="trans-meta">
                      <span class="trans-wallet">{{ getWalletName(trans.walletId) }}</span>
                      <span class="trans-date">{{ formatDate(trans.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <div class="trans-card-right">
                  <span class="trans-amount" :class="trans.type">
                    {{ trans.type === 'income' ? '+' : trans.type === 'expense' ? '-' : '↔' }} Rp {{ formatRupiah(trans.amount) }}
                  </span>
                  <button class="icon-btn danger" @click="handleDeleteTransaction(trans)" title="Hapus">
                    <Icon name="material-symbols:delete-outline" size="20" />
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-text">Belum ada transaksi</div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="dialogConfig.show" class="dialog-overlay">
        <ConfirmDialog
          :title="dialogConfig.title"
          :message="dialogConfig.message"
          :confirmText="dialogConfig.confirmText"
          :cancelText="dialogConfig.cancelText"
          @confirm="dialogConfig.onConfirm(); dialogConfig.show = false"
          @cancel="dialogConfig.show = false"
        />
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteAllDialog" class="dialog-overlay">
        <ConfirmDialog
          :title="t('pages.owner.local_data.delete_all_title')"
          :message="t('pages.owner.local_data.delete_all_message')"
          :confirmText="t('pages.owner.local_data.delete_all_confirm')"
          :cancelText="t('pages.owner.local_data.cancel')"
          @confirm="deleteAll"
          @cancel="showDeleteAllDialog = false"
        />
      </div>
    </Teleport>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">
        <Icon name="material-symbols:check-circle-rounded" size="20" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.local-data-page { padding: 24px 16px 120px; color: var(--md-sys-color-on-surface); max-width: 700px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { margin: 0; font-size: 1.5rem; color: var(--md-sys-color-primary); }
.page-subtitle { margin: 4px 0 0; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); }
.header-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.btn-outline, .btn-danger {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border-radius: 10px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: transparent; color: var(--md-sys-color-on-surface-variant);
}
.btn-outline:hover { background-color: var(--md-sys-color-surface-variant); border-color: var(--md-sys-color-primary); }
.btn-danger { background-color: var(--md-sys-color-error-container); border-color: var(--md-sys-color-error); color: var(--md-sys-color-on-error-container); }
.btn-danger:hover { background-color: var(--md-sys-color-error); color: var(--md-sys-color-on-error); }
.btn-text { background: none; border: none; color: var(--md-sys-color-primary); cursor: pointer; font-size: 0.8rem; font-weight: 500; }

.total-balance-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 18px; background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;
  margin-bottom: 24px; flex-wrap: wrap;
}
.total-label { font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); display: block; margin-bottom: 2px; }
.total-value { font-size: 1.3rem; font-weight: 700; color: var(--md-sys-color-primary); }

.section { margin-bottom: 28px; }
.section-title { font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 12px; padding-left: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

/* ========== SKELETON ========== */
.skel-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-line--section-title { width: 25%; height: 12px; margin-bottom: 12px; }
.skel-line--name { width: 45%; height: 14px; border-radius: 7px; margin-bottom: 6px; }
.skel-line--type { width: 25%; height: 12px; border-radius: 6px; }
.skel-line--balance-label { width: 20%; height: 10px; border-radius: 5px; margin-bottom: 6px; }
.skel-line--balance { width: 60%; height: 18px; border-radius: 9px; }
.skel-line--stat { width: 50%; height: 10px; border-radius: 5px; }
.skel-line--setting { width: 40%; height: 12px; border-radius: 6px; }
.skel-line--toggle { width: 48px; height: 28px; border-radius: 14px; }

.skel-wallet-card { pointer-events: none; }
.skel-icon-bg {
  width: 40px; height: 40px; border-radius: 12px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-texts { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.skel-icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-balance-row {
  display: flex; flex-direction: column; gap: 6px;
  padding: 8px 0; border-top: 1px solid var(--md-sys-color-outline-variant);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  margin-bottom: 12px;
}
.skel-stats-row { display: flex; gap: 12px; }
.skel-icon-sm {
  width: 24px; height: 24px; border-radius: 6px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
  flex-shrink: 0;
}

@keyframes skel-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ========== WALLET GRID ========== */
.wallet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.wallet-card {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 18px; padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.wallet-card-header { display: flex; align-items: center; justify-content: space-between; }
.wallet-card-left { display: flex; align-items: center; gap: 10px; }
.wallet-icon-bg {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--md-sys-color-primary-container);
  display: flex; align-items: center; justify-content: center;
  color: var(--md-sys-color-on-primary-container);
}
.wallet-card-name { font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
.wallet-card-type { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.badge-default { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; }
.wallet-card-balance {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 8px 0; border-top: 1px solid var(--md-sys-color-outline-variant);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
.balance-text { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.balance-amount { font-size: 1.1rem; font-weight: 700; color: var(--md-sys-color-primary); }
.wallet-card-stats { display: flex; gap: 12px; flex-wrap: wrap; }
.stat { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.stat.income { color: #34d399; }
.stat.expense { color: #f87171; }

/* ========== SETTINGS ========== */
.settings-card { background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 16px; overflow: hidden; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--md-sys-color-outline-variant); }
.setting-row:last-child { border-bottom: none; }
.setting-info { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
.setting-value { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); }

.toggle-switch { width: 48px; height: 28px; background: var(--md-sys-color-surface-variant); border: 2px solid var(--md-sys-color-outline); border-radius: 14px; position: relative; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.toggle-switch.active { background: var(--md-sys-color-primary); border-color: var(--md-sys-color-primary); }
.toggle-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: var(--md-sys-color-outline); border-radius: 50%; transition: all 0.2s; }
.toggle-switch.active .toggle-knob { left: 23px; background: var(--md-sys-color-on-primary); }

/* ========== MODAL ========== */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 24px; width: 100%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 14px; border-bottom: 1px solid var(--md-sys-color-outline-variant); }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.close-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.modal-body { padding: 16px 20px 20px; overflow-y: auto; flex: 1; }

.transaction-cards { display: flex; flex-direction: column; gap: 10px; }
.trans-card {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 16px;
  background: var(--md-sys-color-surface-variant);
  border-radius: 16px;
  transition: background-color 0.15s;
}
.trans-card:hover { background: var(--md-sys-color-surface-container); }
.trans-card-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.trans-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.trans-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.trans-desc { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trans-meta { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.trans-wallet { font-weight: 500; }
.trans-date { opacity: 0.8; }

.trans-card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.trans-amount { font-weight: 700; font-size: 1rem; white-space: nowrap; }
.trans-amount.income { color: #34d399; }
.trans-amount.expense { color: #f87171; }
.trans-amount.transfer, .trans-amount.debt { color: #60a5fa; }

.icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: var(--md-sys-color-on-surface-variant); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.icon-btn:hover:not(:disabled) { background: var(--md-sys-color-surface-variant); }
.icon-btn.danger:hover:not(:disabled) { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.empty-text { text-align: center; padding: 20px; color: var(--md-sys-color-on-surface-variant); font-size: 0.9rem; }

.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  padding: 20px;
}

.toast { position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%); background: var(--md-sys-color-inverse-surface); color: var(--md-sys-color-inverse-on-surface); padding: 12px 24px; border-radius: 50px; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 30000; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

@media (max-width: 480px) {
  .local-data-page { padding: 16px 12px 110px; }
  .wallet-grid { grid-template-columns: 1fr; }
  .total-balance-bar { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; justify-content: flex-start; }
  .btn-text-label { display: none; }
  .btn-outline, .btn-danger { padding: 8px 10px; }
}
</style>
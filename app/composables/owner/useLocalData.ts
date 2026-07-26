import { ref, computed } from 'vue'
import { useFinanceStore, getWalletTypeInfo } from '~/composables/finance/useFinanceStore'
import { useFinanceCategories } from '~/composables/finance/useFinanceCategories'
import { useNotification } from '~/composables/shared/useNotification'

// ============================================================
// MODULE-LEVEL SINGLETON STATE
// Semua komponen yang memanggil useLocalData() mendapat ref yang SAMA
// ============================================================
const isMounted = ref(false)
const showDeleteAllDialog = ref(false)
const showTransactionsModal = ref(false)
const showWalletsModal = ref(false)
const showWalletDetailModal = ref(false)
const selectedWallet = ref<any>(null)
const showStorageDetailModal = ref(false)
const selectedStorageKey = ref<string | null>(null)
const transactionFilter = ref('all')
const transactionSearch = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const dialogConfig = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Ya',
  cancelText: 'Batal',
  onConfirm: null as (() => void) | null
})

// ============================================================
// CONSTANTS (tidak perlu reactive, cukup module-level)
// ============================================================
const DATA_KEYS = ['financeWallets', 'financeTransactions', 'financeBalances']

const ALL_DATA_KEYS = [
  'navCenterMenu', 'navFinanceCenter', 'navOwnerCenter',
  'isBalanceHidden', 'financeWallets', 'financeTransactions', 'financeBalances'
]

const STORAGE_KEY_META: Record<string, any> = {
  financeWallets: {
    label: 'Data Dompet',
    description: 'Menyimpan daftar semua dompet (wallet) yang dibuat user termasuk nama, tipe, dan status default.',
    icon: 'material-symbols:wallet-rounded',
    category: 'Keuangan'
  },
  financeTransactions: {
    label: 'Data Transaksi',
    description: 'Menyimpan seluruh riwayat transaksi: pemasukan, pengeluaran, transfer, dan hutang.',
    icon: 'material-symbols:receipt-long-rounded',
    category: 'Keuangan'
  },
  financeBalances: {
    label: 'Data Saldo',
    description: 'Menyimpan saldo aktif setiap dompet. Dihitung otomatis dari transaksi.',
    icon: 'material-symbols:account-balance-rounded',
    category: 'Keuangan'
  }
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua', icon: 'material-symbols:apps-rounded' },
  { value: 'income', label: 'Pemasukan', icon: 'material-symbols:arrow-downward-rounded' },
  { value: 'expense', label: 'Pengeluaran', icon: 'material-symbols:arrow-upward-rounded' },
  { value: 'transfer', label: 'Transfer', icon: 'material-symbols:swap-horiz-rounded' },
  { value: 'debt', label: 'Hutang', icon: 'material-symbols:payments-rounded' }
]

const TYPE_LABELS: Record<string, string> = {
  string: 'String (Teks)',
  array: 'Array (Daftar)',
  object: 'Object (Key-Value)',
  number: 'Number (Angka)',
  boolean: 'Boolean (Ya/Tidak)',
  null: 'Null (Kosong)'
}

const TYPE_COLORS: Record<string, string> = {
  string: '#d97706',
  array: '#2563eb',
  object: '#7c3aed',
  number: '#059669',
  boolean: '#db2777',
  null: '#6b7280'
}

// ============================================================
// COMPOSABLE FUNCTION
// ============================================================
export function useLocalData() {
  const { t } = useI18n()
  const {
    wallets, transactions,
    getWalletBalance, deleteWallet, deleteTransaction
  } = useFinanceStore()
  const { getCategoryById } = useFinanceCategories()

  const { showToast } = useNotification()

  const isClient = import.meta.client

  const isBalanceHidden = useState('isBalanceHidden', () => false)
  const navCenterMenu = useState('navCenterMenu', () => 'running-man')
  const navFinanceCenter = useState('navFinanceCenter', () => 'analytics')
  const navOwnerCenter = useState('navOwnerCenter', () => 'dashboard')

  // ========== COMPUTED ==========
  const walletList = computed(() => wallets.value || [])

  const previewWallets = computed(() => {
    const list = walletList.value
    if (list.length <= 2) return list
    const defaultWallet = list.find((w: any) => w.isDefault)
    const others = list.filter((w: any) => !w.isDefault)
    const result: any[] = []
    if (defaultWallet) result.push(defaultWallet)
    for (const w of others) {
      if (result.length >= 2) break
      result.push(w)
    }
    if (result.length === 0) return list.slice(0, 2)
    return result
  })

  const hasMoreWallets = computed(() => walletList.value.length > 2)

  const sortedTransactionList = computed(() => {
    return (transactions.value || []).slice().sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })

  const filteredTransactions = computed(() => {
    let list = sortedTransactionList.value
    if (transactionFilter.value !== 'all') {
      list = list.filter((t: any) => t.type === transactionFilter.value)
    }
    if (transactionSearch.value.trim()) {
      const q = transactionSearch.value.toLowerCase()
      list = list.filter((t: any) => {
        const cat = getCategoryById(t.categoryId)
        const catLabel = cat ? t(cat.labelKey).toLowerCase() : ''
        const walletName = getWalletName(t.walletId).toLowerCase()
        const desc = (t.description || '').toLowerCase()
        return catLabel.includes(q) || walletName.includes(q) || desc.includes(q)
      })
    }
    return list
  })

  const totalBalance = computed(() => {
    return walletList.value.reduce((sum: number, w: any) => sum + getWalletBalance(w.id), 0)
  })

  const estimateStorageSize = () => {
    if (!isClient) return '0 B'
    let total = 0
    DATA_KEYS.forEach(key => {
      const val = localStorage.getItem(key)
      if (val) total += val.length * 2
    })
    if (total < 1024) return `${total} B`
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`
    return `${(total / (1024 * 1024)).toFixed(2)} MB`
  }

  const stats = computed(() => {
    const txns = transactions.value || []
    return {
      totalWallets: walletList.value.length,
      totalTransactions: txns.length,
      totalIncome: txns.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0),
      totalExpense: txns.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0),
      totalTransfer: txns.filter((t: any) => t.type === 'transfer').reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0),
      totalDebt: txns.filter((t: any) => t.type === 'debt' && !t.isPaid).length,
      storageUsed: estimateStorageSize()
    }
  })

  const storageDetails = computed(() => {
    if (!isClient) return DATA_KEYS.map(key => ({ key, size: '0 KB', active: false }))
    return DATA_KEYS.map(key => {
      const val = localStorage.getItem(key)
      const size = val ? ((val.length * 2) / 1024).toFixed(2) + ' KB' : '0 KB'
      return { key, size, active: val !== null }
    })
  })

  const storageDetailData = computed(() => {
    if (!selectedStorageKey.value || !isClient) return null
    const key = selectedStorageKey.value
    const meta = STORAGE_KEY_META[key] || {
      label: key, description: 'Data localStorage.',
      icon: 'material-symbols:data-object-rounded', category: 'Lainnya'
    }
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return {
        key, meta, active: false, rawValue: null, parsedValue: null,
        type: 'null', size: '0 B', itemCount: 0, preview: '(kosong)',
        keys: [], isJSON: false
      }
    }
    let parsed: any = null
    let isJSON = false
    let type = 'string'
    let itemCount = 0
    let keys: string[] = []
    try {
      parsed = JSON.parse(raw)
      isJSON = true
      type = Array.isArray(parsed) ? 'array' : typeof parsed
      if (Array.isArray(parsed)) itemCount = parsed.length
      else if (typeof parsed === 'object' && parsed !== null) {
        keys = Object.keys(parsed)
        itemCount = keys.length
      }
    } catch {
      parsed = raw
      type = 'string'
      itemCount = raw.length
    }
    const byteSize = raw.length * 2
    let sizeStr: string
    if (byteSize < 1024) sizeStr = `${byteSize} B`
    else if (byteSize < 1024 * 1024) sizeStr = `${(byteSize / 1024).toFixed(2)} KB`
    else sizeStr = `${(byteSize / (1024 * 1024)).toFixed(2)} MB`
    return {
      key, meta, active: true, rawValue: raw, parsedValue: parsed,
      type, size: sizeStr, itemCount, keys, isJSON,
      preview: isJSON ? JSON.stringify(parsed, null, 2) : raw
    }
  })

  // ========== FUNCTIONS ==========
  const getWalletName = (id: string) => {
    const w = walletList.value.find((w: any) => w.id === id)
    return w ? w.name : '-'
  }

  const getWalletStats = (walletId: string) => {
    const txns = (transactions.value || []).filter((t: any) => t.walletId === walletId || t.toWalletId === walletId)
    const income = txns.filter((t: any) => t.type === 'income' && t.walletId === walletId).length
    const expense = txns.filter((t: any) => t.type === 'expense' && t.walletId === walletId).length
    return { total: txns.length, income, expense }
  }

  const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const openConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    dialogConfig.value = { show: true, title, message, confirmText: 'Ya', cancelText: 'Batal', onConfirm }
  }

  const openStorageDetail = (key: string) => {
    selectedStorageKey.value = key
    showStorageDetailModal.value = true
  }

  const handleDeleteStorageKey = (key: string) => {
    const meta = STORAGE_KEY_META[key]
    openConfirmDialog(
      `Hapus "${meta?.label || key}"?`,
      `Data untuk key "${key}" akan dihapus dari localStorage. Tindakan ini tidak bisa dibatalkan.`,
      () => {
        localStorage.removeItem(key)
        showStorageDetailModal.value = false
        showToast(`"${meta?.label || key}" berhasil dihapus`)
        setTimeout(() => window.location.reload(), 500)
      }
    )
  }

  const copyStorageData = () => {
    if (!storageDetailData.value?.rawValue) return
    navigator.clipboard.writeText(storageDetailData.value.rawValue).then(() => {
      showToast('Data berhasil disalin ke clipboard')
    }).catch(() => { showToast('Gagal menyalin data') })
  }

  const handleDeleteWallet = (wallet: any) => {
    if (wallet.isDefault) return showToast('Dompet default tidak bisa dihapus')
    openConfirmDialog(
      'Hapus Dompet?',
      `Hapus dompet "${wallet.name}"? Semua ${getWalletStats(wallet.id).total} transaksi terkait juga akan dihapus.`,
      () => { deleteWallet(wallet.id); showToast('Dompet berhasil dihapus') }
    )
  }

  const handleDeleteTransaction = (trans: any) => {
    const cat = getCategoryById(trans.categoryId)
    const label = cat ? t(cat.labelKey) : trans.type
    openConfirmDialog(
      'Hapus Transaksi?',
      `Hapus "${label}" sebesar Rp ${formatRupiah(trans.amount)}? Balance akan disesuaikan otomatis.`,
      () => { deleteTransaction(trans.id); showToast('Transaksi dihapus') }
    )
  }

  const viewWalletDetail = (wallet: any) => {
    selectedWallet.value = wallet
    showWalletDetailModal.value = true
  }

  const resetNavCenter = (key: string, defaultValue: string) => {
    if (key === 'navCenterMenu') navCenterMenu.value = defaultValue
    else if (key === 'navFinanceCenter') navFinanceCenter.value = defaultValue
    else if (key === 'navOwnerCenter') navOwnerCenter.value = defaultValue
    showToast('Pengaturan direset')
  }

  const deleteAll = () => {
    ALL_DATA_KEYS.forEach(key => localStorage.removeItem(key))
    showDeleteAllDialog.value = false
    showToast('Semua data berhasil dihapus')
    setTimeout(() => window.location.reload(), 500)
  }

  const exportToJSON = () => {
    const data: Record<string, any> = {}
    ALL_DATA_KEYS.forEach(key => {
      const value = localStorage.getItem(key)
      if (value !== null) {
        try { data[key] = JSON.parse(value) } catch { data[key] = value }
      }
    })
    data._meta = { exportedAt: new Date().toISOString(), version: '1.0', totalKeys: Object.keys(data).length }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rout-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data berhasil diekspor')
  }

  const importFromJSON = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid')
        const keysToImport = Object.keys(data).filter(key => ALL_DATA_KEYS.includes(key))
        if (keysToImport.length === 0) return showToast('File tidak mengandung data yang valid')
        openConfirmDialog(
          'Impor Data',
          `Impor ${keysToImport.length} item dari file? Data saat ini akan ditimpa.`,
          () => {
            keysToImport.forEach(key => {
              const value = data[key]
              localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
            })
            showToast('Data berhasil diimpor')
            setTimeout(() => window.location.reload(), 500)
          }
        )
      } catch { showToast('File tidak valid atau rusak') }
    }
    reader.readAsText(file)
    ;(event.target as HTMLInputElement).value = ''
  }

  const triggerImport = () => fileInputRef.value?.click()

  const initMounted = () => {
    nextTick(() => { isMounted.value = true })
  }

  return {
    // Store access
    t, getCategoryById, getWalletTypeInfo, getWalletBalance,
    // Singleton refs (shared across all components)
    isBalanceHidden, isMounted,
    navCenterMenu, navFinanceCenter, navOwnerCenter,
    showDeleteAllDialog, showTransactionsModal, showWalletsModal,
    showWalletDetailModal, selectedWallet,
    showStorageDetailModal, selectedStorageKey,
    transactionFilter, transactionSearch,
    fileInputRef, dialogConfig,
    // Constants
    DATA_KEYS, ALL_DATA_KEYS, STORAGE_KEY_META,
    FILTER_OPTIONS, TYPE_LABELS, TYPE_COLORS,
    // Computed
    walletList, previewWallets, hasMoreWallets,
    sortedTransactionList, filteredTransactions,
    storageDetails, storageDetailData,
    totalBalance, stats,
    // Functions
    getWalletName, getWalletStats,
    formatRupiah, formatDate, formatDateTime,
    showToast, openConfirmDialog,
    openStorageDetail, handleDeleteStorageKey, copyStorageData,
    handleDeleteWallet, handleDeleteTransaction,
    viewWalletDetail, resetNavCenter,
    deleteAll, exportToJSON, importFromJSON, triggerImport,
    initMounted
  }
}

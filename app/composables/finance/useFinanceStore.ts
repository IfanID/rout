import { useBalance } from './useBalance'

export interface WalletType {
  value: string
  label: string
  icon: string
}

export interface Wallet {
  id: number
  name: string
  type: string
  isDefault: boolean
}

export interface Transaction {
  id: number
  walletId: number
  toWalletId?: number | null
  type: 'income' | 'expense' | 'transfer' | 'debt'
  categoryId: string
  amount: number
  description: string
  finePercent: number
  fineAmount: number
  totalDebt: number
  isPaid: boolean
  paidAt: string | null
  createdAt: string
}

export const walletTypes: WalletType[] = [
  { value: 'Cash', label: 'Cash', icon: 'mdi:cash' },
  { value: 'Bank', label: 'Bank', icon: 'mdi:bank' },
  { value: 'E-Wallet', label: 'E-Wallet', icon: 'mdi:wallet-membership' },
  { value: 'Investment', label: 'Investasi', icon: 'mdi:chart-line' },
  { value: 'Other', label: 'Lainnya', icon: 'mdi:wallet' }
]

export const getWalletTypeInfo = (type: string): WalletType => {
  return walletTypes.find(t => t.value === type) || walletTypes[walletTypes.length - 1]
}

export const useFinanceStore = () => {
  const wallets = useState<Wallet[]>('financeWallets', () => [
    { id: 1, name: 'Dompet Utama', type: 'Cash', isDefault: true }
  ])

  const transactions = useState<Transaction[]>('financeTransactions', () => [])

  // ✅ Gunakan useBalance sebagai single source of truth
  const { 
    getBalance, 
    setBalance, 
    updateBalance, 
    deleteBalance: deleteBalanceRecord,
    totalBalance: totalBalanceComputed 
  } = useBalance()

  // ✅ getWalletBalance sekarang ambil dari localStorage
  const getWalletBalance = (walletId: number): number => {
    return getBalance(walletId)
  }

  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  )

  // ✅ totalBalance sekarang dari localStorage
  const totalBalance = totalBalanceComputed

  const addWallet = (name: string, type: string = 'Cash', initialBalance: number = 0) => {
    const newWallet = {
      id: Date.now(),
      name,
      type,
      isDefault: false
    }
    
    wallets.value = [...wallets.value, newWallet]
    
    // ✅ Set balance awal
    if (initialBalance !== 0) {
      setBalance(newWallet.id, initialBalance)
    }
  }

  const renameWallet = (id: number, name: string) => {
    wallets.value = wallets.value.map(w =>
      w.id === id ? { ...w, name } : w
    )
  }

  const changeWalletType = (id: number, type: string) => {
    wallets.value = wallets.value.map(w =>
      w.id === id ? { ...w, type } : w
    )
  }

  const deleteWallet = (id: number) => {
    wallets.value = wallets.value.filter(w => w.id !== id)
    transactions.value = transactions.value.filter(t => t.walletId !== id && t.toWalletId !== id)
    // ✅ Hapus balance record
    deleteBalanceRecord(id)
  }

  const setDefaultWallet = (id: number) => {
    wallets.value = wallets.value.map(w => ({
      ...w,
      isDefault: w.id === id
    }))
  }

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    }
    
    transactions.value = [...transactions.value, newTransaction]
    
    // ✅ Update balance berdasarkan tipe transaksi
    const amount = Number(data.amount) || 0
    
    if (data.type === 'income') {
      updateBalance(data.walletId, amount)
    } else if (data.type === 'expense') {
      updateBalance(data.walletId, -amount)
    } else if (data.type === 'transfer') {
      updateBalance(data.walletId, -amount)
      if (data.toWalletId) {
        updateBalance(data.toWalletId, amount)
      }
    } else if (data.type === 'debt') {
      // Debt: kurangi dari wallet pemberi
      updateBalance(data.walletId, -amount)
      // Tambah ke wallet peminjam (jika ada)
      if (data.toWalletId) {
        updateBalance(data.toWalletId, amount)
      }
    }
  }

  const deleteTransaction = (id: number) => {
    const transaction = transactions.value.find(t => t.id === id)
    
    if (transaction) {
      // ✅ Reverse balance saat transaksi dihapus
      const amount = Number(transaction.amount) || 0
      
      if (transaction.type === 'income') {
        updateBalance(transaction.walletId, -amount)
      } else if (transaction.type === 'expense') {
        updateBalance(transaction.walletId, amount)
      } else if (transaction.type === 'transfer') {
        updateBalance(transaction.walletId, amount)
        if (transaction.toWalletId) {
          updateBalance(transaction.toWalletId, -amount)
        }
      } else if (transaction.type === 'debt') {
        updateBalance(transaction.walletId, amount)
        if (transaction.toWalletId) {
          updateBalance(transaction.toWalletId, -amount)
        }
      }
    }
    
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const payDebt = (debtId: number) => {
    transactions.value = transactions.value.map(t => {
      if (t.id === debtId && t.type === 'debt' && !t.isPaid) {
        // ✅ Update balance saat debt dibayar
        const totalDebt = Number(t.totalDebt) || 0
        
        // Kurangi dari wallet peminjam
        if (t.toWalletId) {
          updateBalance(t.toWalletId, -totalDebt)
        }
        // Kembalikan ke wallet pemberi
        updateBalance(t.walletId, totalDebt)
        
        return {
          ...t,
          isPaid: true,
          paidAt: new Date().toISOString()
        }
      }
      return t
    })
  }

  // ✅ Tambah fungsi untuk set balance manual (dari owner/local-data)
  const setWalletBalanceManual = (walletId: number, amount: number) => {
    setBalance(walletId, amount)
  }

  const defaultWalletId = computed(() => {
    const def = wallets.value.find(w => w.isDefault)
    return def ? def.id : wallets.value[0]?.id ?? null
  })

  return {
    wallets,
    transactions,
    getWalletBalance,
    totalIncome,
    totalExpense,
    totalBalance,
    addWallet,
    renameWallet,
    changeWalletType,
    deleteWallet,
    setDefaultWallet,
    addTransaction,
    deleteTransaction,
    payDebt,
    defaultWalletId,
    setWalletBalanceManual  // ✅ Expose untuk owner/local-data
  }
}

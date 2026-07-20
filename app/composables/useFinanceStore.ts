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

  const getWalletBalance = (walletId: number): number => {
    return transactions.value
      .filter(t => {
        if (t.type === 'income' || t.type === 'expense') {
          return t.walletId === walletId
        }
        if (t.type === 'transfer') {
          return t.walletId === walletId || t.toWalletId === walletId
        }
        if (t.type === 'debt') {
          return t.walletId === walletId || t.toWalletId === walletId
        }
        return false
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0
        const totalDebt = Number(t.totalDebt) || 0

        if (t.type === 'income') return sum + amount
        if (t.type === 'expense') return sum - amount

        if (t.type === 'transfer') {
          if (t.walletId === walletId) return sum - amount
          if (t.toWalletId === walletId) return sum + amount
        }

        if (t.type === 'debt') {
          if (t.walletId === walletId) {
            return sum - amount + (t.isPaid ? totalDebt : 0)
          }
          if (t.toWalletId === walletId) {
            return sum + amount - (t.isPaid ? totalDebt : 0)
          }
        }

        return sum
      }, 0)
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

  const totalBalance = computed(() => totalIncome.value - totalExpense.value)

  const addWallet = (name: string, type: string = 'Cash') => {
    wallets.value = [
      ...wallets.value,
      {
        id: Date.now(),
        name,
        type,
        isDefault: false
      }
    ]
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
  }

  const setDefaultWallet = (id: number) => {
    wallets.value = wallets.value.map(w => ({
      ...w,
      isDefault: w.id === id
    }))
  }

  const addTransaction = (data: any) => {
    transactions.value = [
      ...transactions.value,
      {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString()
      }
    ]
  }

  const deleteTransaction = (id: number) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const payDebt = (debtId: number) => {
    transactions.value = transactions.value.map(t => {
      if (t.id === debtId && t.type === 'debt' && !t.isPaid) {
        return {
          ...t,
          isPaid: true,
          paidAt: new Date().toISOString()
        }
      }
      return t
    })
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
    defaultWalletId
  }
}
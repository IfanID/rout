// Single source of truth untuk balance - disimpan di localStorage

export interface BalanceData {
  [walletId: number]: number
}

export const useBalance = () => {
  const STORAGE_KEY = 'financeBalances'
  
  // State untuk balance per wallet
  const balances = useState<BalanceData>('financeBalances', () => ({}))

  // Get balance untuk wallet tertentu
  const getBalance = (walletId: number): number => {
    return balances.value[walletId] || 0
  }

  // Set balance untuk wallet tertentu
  const setBalance = (walletId: number, amount: number) => {
    balances.value = {
      ...balances.value,
      [walletId]: amount
    }
  }

  // Update balance (tambah/kurang)
  const updateBalance = (walletId: number, delta: number) => {
    const current = balances.value[walletId] || 0
    balances.value = {
      ...balances.value,
      [walletId]: current + delta
    }
  }

  // Delete balance saat wallet dihapus
  const deleteBalance = (walletId: number) => {
    const newBalances = { ...balances.value }
    delete newBalances[walletId]
    balances.value = newBalances
  }

  // Get total balance dari semua wallet
  const totalBalance = computed(() => {
    return Object.values(balances.value).reduce((sum, bal) => sum + bal, 0)
  })

  // Reset semua balance
  const resetAllBalances = () => {
    balances.value = {}
  }

  // Set balance manual (untuk owner/local-data)
  const setBalanceManual = (walletId: number, amount: number) => {
    setBalance(walletId, amount)
  }

  return {
    balances,
    getBalance,
    setBalance,
    updateBalance,
    deleteBalance,
    totalBalance,
    resetAllBalances,
    setBalanceManual
  }
}

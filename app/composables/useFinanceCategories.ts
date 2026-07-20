export interface FinanceCategory {
  id: string
  labelKey: string
  type: 'income' | 'expense' | 'transfer' | 'debt'
  icon: string
  color: string
  fine?: number
}

const categories: FinanceCategory[] = [
  // === INCOME ===
  { id: 'salary',     labelKey: 'categories.income.salary',     type: 'income',  icon: 'mdi:cash-check',       color: '#34d399' },
  { id: 'freelance',  labelKey: 'categories.income.freelance',  type: 'income',  icon: 'mdi:laptop',           color: '#2dd4bf' },
  { id: 'investment', labelKey: 'categories.income.investment',type: 'income',  icon: 'mdi:trending-up',      color: '#4ade80' },
  { id: 'gift_in',   labelKey: 'categories.income.gift',      type: 'income',  icon: 'mdi:gift-outline',     color: '#86efac' },
  { id: 'other_in',  labelKey: 'categories.income.other',     type: 'income',  icon: 'mdi:dots-horizontal',  color: '#9ca3af' },

  // === EXPENSE ===
  { id: 'food',          labelKey: 'categories.expense.food',          type: 'expense', icon: 'mdi:food',               color: '#fb923c' },
  { id: 'transport',     labelKey: 'categories.expense.transport',     type: 'expense', icon: 'mdi:car',                color: '#60a5fa' },
  { id: 'shopping',      labelKey: 'categories.expense.shopping',      type: 'expense', icon: 'mdi:shopping-outline',   color: '#f472b6' },
  { id: 'housing',       labelKey: 'categories.expense.housing',       type: 'expense', icon: 'mdi:home-outline',       color: '#fbbf24' },
  { id: 'bills',         labelKey: 'categories.expense.bills',         type: 'expense', icon: 'mdi:file-document-outline', color: '#c084fc' },
  { id: 'entertainment', labelKey: 'categories.expense.entertainment', type: 'expense', icon: 'mdi:movie-open-outline', color: '#34d399' },
  { id: 'health',        labelKey: 'categories.expense.health',        type: 'expense', icon: 'mdi:heart-pulse',       color: '#f87171' },
  { id: 'other_out',     labelKey: 'categories.expense.other',         type: 'expense', icon: 'mdi:dots-horizontal',   color: '#9ca3af' },

  // === TRANSFER ===
  { id: 'wallet_transfer', labelKey: 'categories.transfer.wallet', type: 'transfer', icon: 'mdi:swap-horizontal',  color: '#60a5fa' },
  { id: 'other_transfer',  labelKey: 'categories.transfer.other',  type: 'transfer', icon: 'mdi:dots-horizontal',  color: '#9ca3af' },

  // === DEBT (fine: persentase denda) ===
  { id: 'loan',       labelKey: 'categories.debt.loan',       type: 'debt', icon: 'mdi:hand-coin-outline', color: '#fbbf24', fine: 5 },
  { id: 'installment',labelKey: 'categories.debt.installment',type: 'debt', icon: 'mdi:calendar-clock',   color: '#fcd34d', fine: 3 },
  { id: 'other_debt', labelKey: 'categories.debt.other',    type: 'debt', icon: 'mdi:dots-horizontal',   color: '#9ca3af', fine: 0 },
]

export const useFinanceCategories = () => {
  const getCategoriesByType = (type: string): FinanceCategory[] => {
    return categories.filter(c => c.type === type)
  }

  const getCategoryById = (id: string): FinanceCategory | undefined => {
    return categories.find(c => c.id === id)
  }

  return {
    categories,
    getCategoriesByType,
    getCategoryById
  }
}
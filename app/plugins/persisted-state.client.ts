// app/plugins/persisted-state.client.ts
import { walletTypes } from '~/composables/useFinanceStore'

export default defineNuxtPlugin((nuxtApp) => {
  const keysToSync = [
    'navCenterMenu',
    'navFinanceCenter',
    'navOwnerCenter',
    'isBalanceHidden',
    'financeWallets',
    'financeTransactions',
    'financeBalances'  // ✅ Tambahkan key untuk balance
  ]

  const applyState = (key: string, savedData: string) => {
    if (key === 'financeTransactions') {
      try {
        const parsed = JSON.parse(savedData)
        const normalized = parsed.map((t: any) => ({
          ...t,
          amount: Number(t.amount) || 0,
          fineAmount: Number(t.fineAmount) || 0,
          totalDebt: Number(t.totalDebt) || 0,
          finePercent: Number(t.finePercent) || 0,
          isPaid: Boolean(t.isPaid),
          createdAt: t.createdAt || new Date().toISOString(),
          paidAt: t.paidAt || null,
          toWalletId: t.toWalletId || null,
          categoryId: t.categoryId || 'other_debt'
        }))
        useState(key).value = normalized
      } catch {
        useState(key).value = JSON.parse(savedData)
      }
    } else if (key === 'financeWallets') {
      try {
        const parsed = JSON.parse(savedData)
        const normalized = parsed.map((w: any) => ({
          id: Number(w.id) || w.id,
          name: String(w.name || 'Wallet'),
          type: String(w.type || 'Cash'),
          isDefault: Boolean(w.isDefault)
        }))
        useState(key).value = normalized
      } catch {
        useState(key).value = JSON.parse(savedData)
      }
    } else if (key === 'financeBalances') {
      // ✅ Normalisasi balance
      try {
        const parsed = JSON.parse(savedData)
        const normalized: Record<number, number> = {}
        Object.keys(parsed).forEach(walletId => {
          normalized[Number(walletId)] = Number(parsed[walletId]) || 0
        })
        useState(key).value = normalized
      } catch {
        useState(key).value = {}
      }
    } else {
      try {
        const parsed = JSON.parse(savedData)
        useState(key).value = parsed
      } catch {
        useState(key).value = savedData === 'true'
          ? true
          : savedData === 'false'
            ? false
            : savedData
      }
    }
  }

  keysToSync.forEach(key => {
    try {
      const savedData = localStorage.getItem(key)
      if (savedData !== null) {
        applyState(key, savedData)
      }
    } catch (error) {
      console.warn(`Gagal membaca ${key} dari localStorage:`, error)
    }

    watch(
      () => useState(key).value,
      (newValue) => {
        try {
          const valueToStore = typeof newValue === 'object'
            ? JSON.stringify(newValue)
            : String(newValue)
          localStorage.setItem(key, valueToStore)
        } catch (error) {
          console.warn(`Gagal menyimpan ${key} ke localStorage:`, error)
        }
      },
      { deep: true }
    )
  })

  nuxtApp.hook('app:mounted', () => {
    nextTick(() => {
      keysToSync.forEach(key => {
        try {
          const savedData = localStorage.getItem(key)
          if (savedData === null) return
          applyState(key, savedData)
        } catch (error) {
          console.warn(`Gagal re-sync ${key} setelah mount:`, error)
        }
      })
    })
  })
})

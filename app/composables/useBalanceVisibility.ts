// Single source of truth untuk visibilitas saldo (Show/Hide).
// Plugin persisted-state.client.ts akan menangani penyimpanan ke localStorage secara otomatis.
export const useBalanceVisibility = () => {
  return useState('isBalanceHidden', () => false)
}
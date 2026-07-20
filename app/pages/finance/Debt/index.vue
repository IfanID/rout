<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const { t } = useI18n()
const { transactions, wallets, getWalletBalance, payDebt } = useFinanceStore()
const { getCategoryById } = useFinanceCategories()
const { showToast } = useNotification()

const isMounted = ref(false)
const showPayDialog = ref(false)
const selectedDebt = ref(null)
const showHistoryModal = ref(false)

const activeDebts = computed(() => {
  return transactions.value
    .filter(t => t.type === 'debt' && t.toWalletId && !t.isPaid)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const historyDebts = computed(() => {
  return transactions.value
    .filter(t => t.type === 'debt' && t.toWalletId && t.isPaid)
    .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
})

const totalUnpaid = computed(() => {
  return activeDebts.value.reduce((sum, d) => sum + (d.totalDebt || 0), 0)
})

const totalPaid = computed(() => {
  return historyDebts.value.reduce((sum, d) => sum + (d.totalDebt || 0), 0)
})

const getWalletName = (id) => {
  const w = wallets.value.find(w => w.id === id)
  return w ? w.name : '-'
}

const getCategoryInfo = (id) => {
  return getCategoryById(id)
}

const formatRupiah = (n) => {
  if (!n && n !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(n)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openPayDialog = (debt) => {
  selectedDebt.value = debt
  showPayDialog.value = true
}

const confirmPay = () => {
  if (selectedDebt.value) {
    const borrowerBalance = getWalletBalance(selectedDebt.value.toWalletId)
    if (borrowerBalance < (selectedDebt.value.totalDebt || 0)) {
      showToast('Saldo dompet peminjam tidak mencukupi untuk membayar hutang!', 'error')
      return
    }
    payDebt(selectedDebt.value.id)
    showPayDialog.value = false
    selectedDebt.value = null
    showToast('Pembayaran berhasil', 'success')
  }
}

const cancelPay = () => {
  showPayDialog.value = false
  selectedDebt.value = null
}

onMounted(() => {
  nextTick(() => {
    isMounted.value = true
  })
})
</script>

<template>
  <div class="debt-page">
    <!-- ========== SKELETON ========== -->
    <template v-if="!isMounted">
      <div class="page-header">
        <div class="header-left">
          <div class="skel-line skel-line--title"></div>
          <div class="skel-line skel-line--subtitle"></div>
        </div>
      </div>
      <div class="summary-row">
        <div class="summary-card skel-summary">
          <div class="skel-summary-icon"></div>
          <div class="skel-summary-texts">
            <div class="skel-line skel-line--xs"></div>
            <div class="skel-line skel-line--amount-sm"></div>
          </div>
        </div>
        <div class="summary-card skel-summary">
          <div class="skel-summary-icon"></div>
          <div class="skel-summary-texts">
            <div class="skel-line skel-line--xs"></div>
            <div class="skel-line skel-line--amount-sm"></div>
          </div>
        </div>
      </div>
      <div v-for="i in 2" :key="i" class="skel-debt-card">
        <div class="skel-debt-header">
          <div class="skel-debt-left">
            <div class="skel-debt-icon"></div>
            <div class="skel-debt-texts">
              <div class="skel-line skel-line--name"></div>
              <div class="skel-line skel-line--date"></div>
            </div>
          </div>
          <div class="skel-debt-total">
            <div class="skel-line skel-line--xs"></div>
            <div class="skel-line skel-line--amount-sm"></div>
          </div>
        </div>
        <div class="skel-debt-route">
          <div class="skel-chip"></div>
          <div class="skel-chip-arrow"></div>
          <div class="skel-chip"></div>
        </div>
        <div class="skel-debt-bottom">
          <div class="skel-line skel-line--breakdown"></div>
          <div class="skel-pay-btn"></div>
        </div>
      </div>
    </template>

    <!-- ========== KONTEN ASLI ========== -->
    <template v-else>
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ t('pages.finance.debt.title') }}</h1>
          <p class="page-subtitle">{{ t('pages.finance.debt.subtitle') }}</p>
        </div>
        <button class="history-btn" @click="showHistoryModal = true" v-if="historyDebts.length > 0">
          <Icon name="mdi:history" size="24" />
          <span class="history-label">{{ t('pages.finance.debt.history') }}</span>
        </button>
      </div>

      <div class="summary-row">
        <div class="summary-card unpaid">
          <div class="summary-icon-wrap">
            <Icon name="mdi:clock-alert-outline" size="24" />
          </div>
          <div class="summary-text">
            <span class="summary-label">{{ t('pages.finance.debt.unpaid') }}</span>
            <span class="summary-value">Rp {{ formatRupiah(totalUnpaid) }}</span>
          </div>
        </div>
        <div class="summary-card paid">
          <div class="summary-icon-wrap">
            <Icon name="mdi:check-circle-outline" size="24" />
          </div>
          <div class="summary-text">
            <span class="summary-label">{{ t('pages.finance.debt.paid') }}</span>
            <span class="summary-value">Rp {{ formatRupiah(totalPaid) }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeDebts.length === 0" class="empty-state">
        <div class="empty-icon-bg">
          <Icon name="mdi:hand-coin-outline" size="40" />
        </div>
        <p class="empty-text">{{ t('pages.finance.debt.empty') }}</p>
      </div>

      <div v-else class="debt-list">
        <div v-for="debt in activeDebts" :key="debt.id" class="debt-card">
          <div class="debt-card-header">
            <div class="debt-cat-info">
              <div
                class="debt-cat-icon"
                :style="{
                  backgroundColor: getCategoryInfo(debt.categoryId)?.color + '20',
                  color: getCategoryInfo(debt.categoryId)?.color
                }"
              >
                <Icon :name="getCategoryInfo(debt.categoryId)?.icon || 'mdi:help-circle-outline'" size="24" />
              </div>
              <div class="debt-cat-text">
                <span class="debt-cat-name">
                  {{ getCategoryInfo(debt.categoryId) ? t(getCategoryInfo(debt.categoryId).labelKey) : '-' }}
                </span>
                <span class="debt-date">{{ formatDate(debt.createdAt) }}</span>
              </div>
            </div>
            <div class="debt-total-top">
              <span class="total-label">{{ t('pages.finance.debt.total') }}</span>
              <span class="total-value">Rp {{ formatRupiah(debt.totalDebt) }}</span>
            </div>
          </div>

          <div class="debt-route">
            <div class="wallet-chip from">
              <Icon name="mdi:arrow-up-right" size="14" />
              <span>{{ getWalletName(debt.walletId) }}</span>
            </div>
            <div class="route-arrow-icon">
              <Icon name="mdi:chevron-right" size="20" />
            </div>
            <div class="wallet-chip to">
              <Icon name="mdi:arrow-down-left" size="14" />
              <span>{{ getWalletName(debt.toWalletId) }}</span>
            </div>
          </div>

          <div class="debt-breakdown">
            <div class="breakdown-row">
              <span class="breakdown-label">{{ t('pages.finance.debt.principal') }}</span>
              <span class="breakdown-value">Rp {{ formatRupiah(debt.amount) }}</span>
            </div>
            <div v-if="debt.fineAmount > 0" class="breakdown-row">
              <span class="breakdown-label">{{ t('pages.fine_percent', [debt.finePercent]) }}</span>
              <span class="breakdown-value fine-color">Rp {{ formatRupiah(debt.fineAmount) }}</span>
            </div>
          </div>

          <div v-if="debt.description" class="debt-description">
            <Icon name="mdi:note-text-outline" size="16" class="desc-icon" />
            <span>{{ debt.description }}</span>
          </div>

          <button class="pay-btn" @click="openPayDialog(debt)">
            <Icon name="mdi:cash-check" size="20" />
            <span>{{ t('pages.finance.debt.pay') }}</span>
          </button>
        </div>
      </div>

      <!-- Modal Riwayat -->
      <Teleport to="body">
        <div v-if="showHistoryModal" class="history-modal-overlay" @click.self="showHistoryModal = false">
          <div class="history-modal">
            <div class="history-modal-header">
              <h2 class="history-modal-title">{{ t('pages.finance.debt.history_title') }}</h2>
              <button class="history-close-btn" @click="showHistoryModal = false">
                <Icon name="mdi:close" size="24" />
              </button>
            </div>
            <div class="history-modal-body" v-if="historyDebts.length > 0">
              <div v-for="debt in historyDebts" :key="debt.id" class="history-item">
                <div class="history-item-left">
                  <div
                    class="history-cat-icon"
                    :style="{ backgroundColor: getCategoryInfo(debt.categoryId)?.color + '20' }"
                  >
                    <Icon
                      :name="getCategoryInfo(debt.categoryId)?.icon || 'mdi:help-circle-outline'"
                      size="20"
                      :style="{ color: getCategoryInfo(debt.categoryId)?.color }"
                    />
                  </div>
                  <div class="history-item-details">
                    <span class="history-item-name">{{ getCategoryInfo(debt.categoryId) ? t(getCategoryInfo(debt.categoryId).labelKey) : '-' }}</span>
                    <span class="history-item-date">{{ formatDate(debt.paidAt) }}</span>
                  </div>
                </div>
                <div class="history-item-right">
                  <span class="history-item-amount">Rp {{ formatRupiah(debt.totalDebt) }}</span>
                  <span class="history-item-wallet">{{ getWalletName(debt.walletId) }} → {{ getWalletName(debt.toWalletId) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="history-empty">
              <Icon name="mdi:history" size="48" class="history-empty-icon" />
              <p>{{ t('pages.finance.debt.history_empty') }}</p>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Dialog Bayar -->
      <Teleport to="body">
        <div v-if="showPayDialog && selectedDebt" class="pay-dialog-overlay" @click.self="cancelPay">
          <div class="pay-dialog">
            <div class="pay-dialog-header">
              <div class="pay-dialog-icon-wrap">
                <Icon name="mdi:cash-clock" size="28" />
              </div>
              <div class="pay-dialog-title-group">
                <h3 class="pay-dialog-title">{{ t('pages.finance.debt.pay_confirm_title') }}</h3>
                <p class="pay-dialog-subtitle">{{ t('pages.finance.debt.pay_confirm_desc') }}</p>
              </div>
            </div>
            <div class="pay-dialog-body">
              <div class="pay-detail-row">
                <span class="pay-detail-label">{{ t('pages.finance.debt.principal') }}</span>
                <span class="pay-detail-value">Rp {{ formatRupiah(selectedDebt.amount) }}</span>
              </div>
              <div v-if="selectedDebt.fineAmount > 0" class="pay-detail-row">
                <span class="pay-detail-label">{{ t('pages.fine_percent', [selectedDebt.finePercent]) }}</span>
                <span class="pay-detail-value fine-color">Rp {{ formatRupiah(selectedDebt.fineAmount) }}</span>
              </div>
              <div class="pay-detail-row pay-detail-total">
                <span class="pay-detail-label">{{ t('pages.finance.debt.total') }}</span>
                <span class="pay-detail-value pay-total-value">Rp {{ formatRupiah(selectedDebt.totalDebt) }}</span>
              </div>
              <div class="pay-detail-wallet">
                <Icon name="mdi:wallet-outline" size="16" />
                <span>{{ t('pages.finance.debt.pay_from') }}: <strong>{{ getWalletName(selectedDebt.toWalletId) }}</strong></span>
                <span class="wallet-current-balance">(Saldo: Rp {{ formatRupiah(getWalletBalance(selectedDebt.toWalletId)) }})</span>
              </div>
            </div>
            <div class="pay-dialog-actions">
              <button class="pay-dialog-btn cancel" @click="cancelPay">
                {{ t('pages.finance.debt.cancel') }}
              </button>
              <button class="pay-dialog-btn confirm" @click="confirmPay">
                {{ t('pages.finance.debt.yes_pay') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<style scoped>
/* ========== BASE ========== */
.debt-page {
  min-height: 100vh;
  padding: 24px 20px 120px;
  color: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-surface);
  position: relative;
}

/* ========== SKELETON ========== */
.skel-line {
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-line--title { width: 40%; height: 28px; border-radius: 14px; margin-bottom: 6px; }
.skel-line--subtitle { width: 50%; }
.skel-line--xs { width: 40%; height: 10px; border-radius: 5px; margin-bottom: 6px; }
.skel-line--amount-sm { width: 70%; height: 20px; border-radius: 10px; }
.skel-line--name { width: 50%; height: 16px; border-radius: 8px; margin-bottom: 6px; }
.skel-line--date { width: 35%; height: 12px; border-radius: 6px; }
.skel-line--breakdown { width: 45%; height: 14px; border-radius: 7px; }

.skel-summary {
  pointer-events: none;
}
.skel-summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-summary-texts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.skel-debt-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 22px;
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.skel-debt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.skel-debt-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.skel-debt-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-debt-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.skel-debt-total {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}
.skel-debt-route {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 14px;
}
.skel-chip {
  flex: 1;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
}
.skel-chip-arrow {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}
.skel-debt-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.skel-pay-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.5s infinite;
  flex-shrink: 0;
  width: 120px;
}

@keyframes skel-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ========== HEADER ========== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--md-sys-color-on-surface);
  letter-spacing: -0.5px;
}
.page-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 400;
}
.history-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 14px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.history-btn:hover { background-color: var(--md-sys-color-outline-variant); color: var(--md-sys-color-on-surface); }
.history-btn:active { transform: scale(0.96); }

/* ========== SUMMARY ========== */
.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 28px;
}
.summary-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); }
.summary-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-card.unpaid .summary-icon-wrap { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.summary-card.paid .summary-icon-wrap { background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.summary-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.summary-label { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.summary-value { font-size: 1.2rem; font-weight: 800; color: var(--md-sys-color-on-surface); font-variant-numeric: tabular-nums; letter-spacing: -0.3px; }

/* ========== EMPTY STATE ========== */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
.empty-icon-bg { width: 80px; height: 80px; border-radius: 24px; background-color: var(--md-sys-color-surface-variant); display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-outline); margin-bottom: 20px; opacity: 0.6; }
.empty-text { font-size: 1rem; color: var(--md-sys-color-on-surface-variant); margin: 0; font-weight: 500; }

/* ========== DEBT LIST ========== */
.debt-list { display: flex; flex-direction: column; gap: 18px; }
.debt-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 22px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}
.debt-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #fbbf24, #f59e0b); opacity: 0.3; }
.debt-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); }
.debt-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px; }
.debt-cat-info { display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1; }
.debt-cat-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.debt-cat-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.debt-cat-name { font-size: 1rem; font-weight: 700; color: var(--md-sys-color-on-surface); }
.debt-date { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.debt-total-top { text-align: right; flex-shrink: 0; }
.total-label { display: block; font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
.total-value { font-size: 1.2rem; font-weight: 800; color: #fbbf24; font-variant-numeric: tabular-nums; }

/* ========== ROUTE ========== */
.debt-route { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background-color: var(--md-sys-color-surface-variant); border-radius: 14px; margin-bottom: 16px; }
.wallet-chip { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; flex: 1; justify-content: center; }
.wallet-chip.from { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.wallet-chip.to { background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.route-arrow-icon { color: var(--md-sys-color-outline); flex-shrink: 0; }

/* ========== BREAKDOWN ========== */
.debt-breakdown { margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px; }
.breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.breakdown-label { font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); }
.breakdown-value { font-size: 0.9rem; font-weight: 600; color: var(--md-sys-color-on-surface); font-variant-numeric: tabular-nums; }
.fine-color { color: #f59e0b; }

/* ========== DESCRIPTION ========== */
.debt-description { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background-color: var(--md-sys-color-surface-variant); border-radius: 10px; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 16px; }
.desc-icon { flex-shrink: 0; opacity: 0.6; }

/* ========== PAY BTN ========== */
.pay-btn { width: 100%; padding: 14px; background-color: #fbbf24; color: #1a1a1a; border: none; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s ease; }
.pay-btn:hover { background-color: #f59e0b; transform: translateY(-1px); }
.pay-btn:active { transform: scale(0.97); }

/* ========== HISTORY MODAL ========== */
.history-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
.history-modal { background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 24px; width: 100%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4); animation: scaleIn 0.3s cubic-bezier(0.175, 0.8, 0.32, 1.275); }
.history-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 24px 18px; border-bottom: 1px solid var(--md-sys-color-outline-variant); flex-shrink: 0; }
.history-modal-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--md-sys-color-on-surface); }
.history-close-btn { width: 36px; height: 36px; border-radius: 50%; background-color: var(--md-sys-color-surface-variant); border: none; color: var(--md-sys-color-on-surface-variant); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.history-close-btn:hover { background-color: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.history-modal-body { padding: 16px 24px 24px; overflow-y: auto; flex: 1; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background-color: var(--md-sys-color-surface-variant); border-radius: 14px; margin-bottom: 10px; }
.history-item-left { display: flex; align-items: center; gap: 12px; }
.history-cat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.history-item-details { display: flex; flex-direction: column; gap: 2px; }
.history-item-name { font-size: 0.9rem; font-weight: 600; color: var(--md-sys-color-on-surface); }
.history-item-date { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.history-item-right { text-align: right; }
.history-item-amount { display: block; font-size: 0.95rem; font-weight: 700; color: #34d399; }
.history-item-wallet { font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant); }
.history-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--md-sys-color-on-surface-variant); text-align: center; }
.history-empty-icon { opacity: 0.4; margin-bottom: 16px; color: var(--md-sys-color-outline); }

/* ========== PAY DIALOG ========== */
.pay-dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
.pay-dialog { background-color: var(--md-sys-color-surface-container); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 28px; padding: 26px; width: 100%; max-width: 380px; box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4); animation: scaleIn 0.3s cubic-bezier(0.175, 0.8, 0.32, 1.275); }
.pay-dialog-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.pay-dialog-icon-wrap { width: 52px; height: 52px; border-radius: 16px; background-color: rgba(251, 191, 36, 0.15); color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pay-dialog-title-group { display: flex; flex-direction: column; gap: 2px; }
.pay-dialog-title { margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--md-sys-color-on-surface); }
.pay-dialog-subtitle { margin: 0; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }
.pay-dialog-body { background-color: var(--md-sys-color-surface-variant); border-radius: 16px; padding: 18px; margin-bottom: 24px; }
.pay-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.pay-detail-row + .pay-detail-row { border-top: 1px solid var(--md-sys-color-outline-variant); }
.pay-detail-total { border-top: 2px solid #fbbf24 !important; margin-top: 8px; padding-top: 12px; }
.pay-detail-label { font-size: 0.9rem; color: var(--md-sys-color-on-surface-variant); }
.pay-detail-value { font-size: 0.95rem; font-weight: 600; color: var(--md-sys-color-on-surface); font-variant-numeric: tabular-nums; }
.pay-total-value { font-size: 1.2rem; font-weight: 800; color: #fbbf24; }
.pay-detail-wallet { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; background-color: var(--md-sys-color-surface-container); border-radius: 8px; font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant); flex-wrap: wrap; }
.wallet-current-balance { font-size: 0.8rem; color: var(--md-sys-color-primary); font-weight: 600; margin-left: auto; }
.pay-dialog-actions { display: flex; gap: 14px; }
.pay-dialog-btn { flex: 1; padding: 14px; border: none; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
.pay-dialog-btn.cancel { background-color: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); }
.pay-dialog-btn.cancel:hover { background-color: var(--md-sys-color-outline-variant); }
.pay-dialog-btn.confirm { background-color: #fbbf24; color: #1a1a1a; }
.pay-dialog-btn.confirm:hover { background-color: #f59e0b; }

/* ========== ANIMATIONS ========== */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* ========== RESPONSIVE ========== */
@media (max-width: 480px) {
  .debt-page { padding: 20px 14px 110px; }
  .page-title { font-size: 1.5rem; }
  .history-btn { padding: 8px 12px; font-size: 0.8rem; }
  .history-label { display: none; }
  .summary-row { grid-template-columns: 1fr; gap: 10px; }
  .debt-card { padding: 18px; }
  .debt-card-header { flex-direction: column; gap: 12px; }
  .debt-total-top { text-align: left; }
  .history-modal { max-width: 100%; margin: 0 10px; }
}
</style>
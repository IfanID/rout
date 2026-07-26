<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const { t } = useI18n()
const { transactions, wallets, getWalletBalance, payDebt } = useFinanceStore()
const { getCategoryById } = useFinanceCategories()
const { showToast } = useNotification()

const isMounted = ref(false)
const showPayDialog = ref(false)
const selectedDebt = ref(null)
const showHistoryModal = ref(false)

// ========== REAL-TIME CLOCK (per detik) ==========
const now = ref(new Date())
let clockTimer = null

onMounted(() => {
  nextTick(() => { isMounted.value = true })
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// ========== EDIT TARGET STATE ==========
const editingDebtId = ref(null)
const editTargetValue = ref('')

// ========== COMPUTED ==========
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

const totalUnpaid = computed(() =>
  activeDebts.value.reduce((sum, d) => sum + (d.totalDebt || 0), 0)
)

const totalPaid = computed(() =>
  historyDebts.value.reduce((sum, d) => sum + (d.totalDebt || 0), 0)
)

// ========== HELPERS ==========
const getWalletName = (id) => {
  const w = wallets.value.find(w => w.id === id)
  return w ? w.name : '-'
}

const getCategoryInfo = (id) => getCategoryById(id)

const formatRupiah = (n) => {
  if (!n && n !== 0) return '0'
  return new Intl.NumberFormat('id-ID').format(n)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ========== TARGET PEMBAYARAN ==========
const getDefaultTargetDate = (dateStr) => {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  const dayOfMonth = d.getDate()
  d.setMonth(d.getMonth() + 1)
  if (d.getDate() !== dayOfMonth) d.setDate(0)
  return d
}

const getTargetDate = (debt) => {
  if (debt.targetDate) return new Date(debt.targetDate)
  return getDefaultTargetDate(debt.createdAt)
}

const parseDateParts = (input) => {
  if (!input) return null
  const d = input instanceof Date ? input : new Date(input)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', ''),
    monthFull: d.toLocaleDateString('id-ID', { month: 'long' }),
    year: d.getFullYear(),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    weekday: d.toLocaleDateString('id-ID', { weekday: 'long' })
  }
}

const formatDateShort = (input) => {
  if (!input) return '-'
  const d = input instanceof Date ? input : new Date(input)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ========== COUNTDOWN ==========
const getCountdown = (debt) => {
  const target = getTargetDate(debt)
  const diff = target.getTime() - now.value.getTime()
  const isOverdue = diff < 0
  const absDiff = Math.abs(diff)

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000)

  return { isOverdue, days, hours, minutes, seconds }
}

const getTargetStatus = (debt) => {
  const cd = getCountdown(debt)
  const diffDays = cd.days

  if (cd.isOverdue) {
    if (diffDays <= 30) return { type: 'overdue', label: `Melewati Target ${diffDays} Hari`, icon: 'mdi:alert-circle-outline' }
    const months = Math.floor(diffDays / 30)
    const remainDays = diffDays % 30
    if (remainDays === 0) return { type: 'overdue', label: `Melewati Target ${months} Bulan`, icon: 'mdi:alert-circle-outline' }
    return { type: 'overdue', label: `Melewati Target ${months} Bln ${remainDays} Hari`, icon: 'mdi:alert-circle-outline' }
  }

  if (diffDays === 0) return { type: 'urgent', label: 'Hari Ini Target Pembayaran', icon: 'mdi:calendar-refresh' }
  if (diffDays === 1) return { type: 'urgent', label: 'Besok Target Pembayaran', icon: 'mdi:clock-alert-outline' }
  if (diffDays <= 3) return { type: 'soon', label: `Sisa ${diffDays} Hari`, icon: 'mdi:clock-outline' }
  return { type: 'safe', label: `Sisa ${diffDays} Hari`, icon: 'mdi:calendar-clock' }
}

const isOverdue = (debt) => getCountdown(debt).isOverdue

const isCustomTarget = (debt) => !!debt.targetDate

// ========== EDIT TARGET ==========
const toDatetimeLocal = (dateInput) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const startEditTarget = (debt) => {
  editingDebtId.value = debt.id
  editTargetValue.value = toDatetimeLocal(getTargetDate(debt))
}

const cancelEditTarget = () => {
  editingDebtId.value = null
  editTargetValue.value = ''
}

const saveTargetDate = (debt) => {
  if (!editTargetValue.value) {
    showToast('Pilih tanggal target terlebih dahulu', 'error')
    return
  }
  const newDate = new Date(editTargetValue.value)
  const createdDate = new Date(debt.createdAt)

  if (newDate.getTime() <= createdDate.getTime()) {
    showToast('Target pembayaran harus setelah tanggal dibuat', 'error')
    return
  }

  const idx = transactions.value.findIndex(t => t.id === debt.id)
  if (idx !== -1) {
    transactions.value[idx] = { ...transactions.value[idx], targetDate: newDate.toISOString() }
    showToast('Target pembayaran berhasil diperbarui', 'success')
  }
  cancelEditTarget()
}

const resetTargetToDefault = (debt) => {
  const idx = transactions.value.findIndex(t => t.id === debt.id)
  if (idx !== -1) {
    const { targetDate, ...rest } = transactions.value[idx]
    transactions.value[idx] = rest
    showToast('Target dikembalikan ke default (1 bulan)', 'success')
  }
  cancelEditTarget()
}

// ========== HISTORY SETTLEMENT ==========
const getSettlementInfo = (debt) => {
  const created = new Date(debt.createdAt)
  const paid = new Date(debt.paidAt || debt.createdAt)
  const target = getTargetDate(debt)

  const createdDay = new Date(created.getFullYear(), created.getMonth(), created.getDate())
  const paidDay = new Date(paid.getFullYear(), paid.getMonth(), paid.getDate())
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate())

  const totalDays = Math.max(1, Math.round((paidDay - createdDay) / (1000 * 60 * 60 * 24)))
  const overdueDays = Math.round((paidDay - targetDay) / (1000 * 60 * 60 * 24))

  return { totalDays, overdueDays: Math.max(0, overdueDays), isOverdue: overdueDays > 0 }
}

// ========== PAY DIALOG ==========
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
</script>

<template>
  <div class="debt-page">
    <SkeletonAppSkeletonLoader :show="!isMounted" size="md" fullscreen />

    <template v-if="isMounted">
      <!-- ========== PAGE HEADER ========== -->
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

      <!-- ========== SUMMARY ROW ========== -->
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

      <!-- ========== EMPTY STATE ========== -->
      <div v-if="activeDebts.length === 0" class="empty-state">
        <div class="empty-icon-bg">
          <Icon name="mdi:hand-coin-outline" size="40" />
        </div>
        <p class="empty-text">{{ t('pages.finance.debt.empty') }}</p>
      </div>

      <!-- ========== DEBT LIST ========== -->
      <div v-else class="debt-list">
        <div
          v-for="debt in activeDebts"
          :key="debt.id"
          class="debt-card"
          :class="{ 'debt-card--overdue': isOverdue(debt) }"
        >
          <!-- Card Header: Category + Total -->
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

          <!-- Wallet Route -->
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

          <!-- Breakdown: Principal + Fine -->
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

          <!-- ========== TARGET PEMBAYARAN MODERN ========== -->
          <div class="debt-target-modern" :class="'target-modern--' + getTargetStatus(debt).type">
            <!-- Row 1: Dibuat -->
            <div class="target-date-card">
              <div class="target-date-visual">
                <div class="date-block">
                  <span class="date-block-day">{{ parseDateParts(debt.createdAt)?.day }}</span>
                  <span class="date-block-month">{{ parseDateParts(debt.createdAt)?.month }}</span>
                </div>
              </div>
              <div class="target-date-info">
                <div class="target-info-header">
                  <Icon name="mdi:calendar-plus" size="14" class="target-info-icon" />
                  <span class="target-info-label">Dibuat</span>
                </div>
                <div class="target-info-main">
                  {{ parseDateParts(debt.createdAt)?.weekday }}, {{ parseDateParts(debt.createdAt)?.monthFull }} {{ parseDateParts(debt.createdAt)?.year }}
                </div>
                <div class="target-info-time">
                  <Icon name="mdi:clock-outline" size="12" />
                  <span>Pukul {{ parseDateParts(debt.createdAt)?.time }}</span>
                </div>
              </div>
            </div>

            <!-- Connector -->
            <div class="target-connector">
              <div class="connector-line"></div>
              <div class="connector-dot"></div>
              <div class="connector-line"></div>
            </div>

            <!-- Row 2: Target Pembayaran -->
            <div class="target-date-card target-date-card--highlight">
              <div class="target-date-visual">
                <div class="date-block date-block--accent">
                  <span class="date-block-day">{{ parseDateParts(getTargetDate(debt))?.day }}</span>
                  <span class="date-block-month">{{ parseDateParts(getTargetDate(debt))?.month }}</span>
                </div>
              </div>
              <div class="target-date-info">
                <div class="target-info-header">
                  <Icon name="mdi:calendar-refresh" size="14" class="target-info-icon target-info-icon--accent" />
                  <span class="target-info-label">Target Pembayaran</span>
                  <span v-if="isCustomTarget(debt)" class="target-custom-badge">
                    <Icon name="mdi:pencil-circle" size="10" />
                    Kustom
                  </span>
                  <button
                    v-if="editingDebtId !== debt.id"
                    class="target-edit-trigger"
                    @click="startEditTarget(debt)"
                    title="Ubah target"
                  >
                    <Icon name="mdi:pencil-outline" size="14" />
                  </button>
                </div>

                <!-- Normal view -->
                <template v-if="editingDebtId !== debt.id">
                  <div class="target-info-main" :class="{ 'target-info-main--overdue': isOverdue(debt) }">
                    {{ parseDateParts(getTargetDate(debt))?.weekday }}, {{ parseDateParts(getTargetDate(debt))?.monthFull }} {{ parseDateParts(getTargetDate(debt))?.year }}
                  </div>
                  <div class="target-info-time">
                    <Icon name="mdi:clock-outline" size="12" />
                    <span>Pukul {{ parseDateParts(getTargetDate(debt))?.time }}</span>
                  </div>
                </template>

                <!-- Edit mode - COMPACT (tidak melebar) -->
                <template v-else>
                  <div class="target-edit-compact">
                    <div class="edit-input-wrap">
                      <Icon name="mdi:calendar-edit" size="14" class="edit-input-icon" />
                      <input
                        type="datetime-local"
                        v-model="editTargetValue"
                        :min="toDatetimeLocal(debt.createdAt)"
                        class="edit-compact-input"
                      />
                    </div>
                    <div class="edit-compact-actions">
                      <button class="compact-btn compact-btn--reset" @click="resetTargetToDefault(debt)" title="Reset default">
                        <Icon name="mdi:refresh" size="14" />
                      </button>
                      <button class="compact-btn compact-btn--cancel" @click="cancelEditTarget" title="Batal">
                        <Icon name="mdi:close" size="14" />
                      </button>
                      <button class="compact-btn compact-btn--save" @click="saveTargetDate(debt)" title="Simpan">
                        <Icon name="mdi:check" size="14" />
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Countdown Bar - Live per detik -->
            <div class="countdown-bar" :class="'countdown-bar--' + getTargetStatus(debt).type">
              <div class="countdown-bar-left">
                <div class="countdown-pulse" :class="{ 'countdown-pulse--active': !isOverdue(debt) }"></div>
                <Icon :name="getTargetStatus(debt).icon" size="18" class="countdown-bar-icon" />
                <span class="countdown-bar-label">{{ getTargetStatus(debt).label }}</span>
              </div>
              <div class="countdown-bar-right">
                <div class="countdown-timer">
                  <span class="timer-segment">{{ String(getCountdown(debt).hours).padStart(2, '0') }}</span>
                  <span class="timer-sep">:</span>
                  <span class="timer-segment">{{ String(getCountdown(debt).minutes).padStart(2, '0') }}</span>
                  <span class="timer-sep">:</span>
                  <span class="timer-segment timer-segment--seconds">{{ String(getCountdown(debt).seconds).padStart(2, '0') }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- ========== END TARGET PEMBAYARAN ========== -->

          <!-- Description -->
          <div v-if="debt.description" class="debt-description">
            <Icon name="mdi:note-text-outline" size="16" class="desc-icon" />
            <span>{{ debt.description }}</span>
          </div>

          <!-- Pay Button -->
          <button class="pay-btn" @click="openPayDialog(debt)">
            <Icon name="mdi:cash-check" size="20" />
            <span>{{ t('pages.finance.debt.pay') }}</span>
          </button>
        </div>
      </div>

      <!-- ========== MODAL RIWAYAT ========== -->
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
                    <span class="history-item-name">
                      {{ getCategoryInfo(debt.categoryId) ? t(getCategoryInfo(debt.categoryId).labelKey) : '-' }}
                    </span>
                    <div class="history-timeline">
                      <div class="history-timeline-row">
                        <span class="history-timeline-label">Dibuat</span>
                        <span class="history-timeline-value">{{ formatDateShort(debt.createdAt) }}</span>
                      </div>
                      <div class="history-timeline-row">
                        <span class="history-timeline-label">Target</span>
                        <span class="history-timeline-value">{{ formatDateShort(getTargetDate(debt)) }}</span>
                      </div>
                      <div class="history-timeline-row">
                        <span class="history-timeline-label">Dilunasi</span>
                        <span class="history-timeline-value">{{ formatDateShort(debt.paidAt) }}</span>
                      </div>
                    </div>
                    <div
                      class="history-settlement-badge"
                      :class="getSettlementInfo(debt).isOverdue ? 'settlement--overdue' : 'settlement--ontime'"
                    >
                      <Icon
                        :name="getSettlementInfo(debt).isOverdue ? 'mdi:clock-alert-outline' : 'mdi:check-circle-outline'"
                        size="14"
                      />
                      <span v-if="!getSettlementInfo(debt).isOverdue">
                        Lunas dalam {{ getSettlementInfo(debt).totalDays }} Hari
                      </span>
                      <span v-else>
                        Melewati target {{ getSettlementInfo(debt).overdueDays }} Hari sebelum dilunasi
                      </span>
                    </div>
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

      <!-- ========== DIALOG KONFIRMASI BAYAR ========== -->
      <Teleport to="body">
        <div v-if="showPayDialog && selectedDebt" class="pay-dialog-overlay" @click.self="cancelPay">
          <div class="pay-dialog">
            <div class="pay-dialog-header">
              <div class="pay-dialog-icon-wrap">
                <Icon name="mdi:cash-check" size="28" />
              </div>
              <div class="pay-dialog-title-group">
                <h3 class="pay-dialog-title">Konfirmasi Pembayaran</h3>
                <p class="pay-dialog-subtitle">Pastikan data di bawah sudah benar sebelum melanjutkan</p>
              </div>
            </div>
            <div class="pay-dialog-body">
              <div class="pay-detail-row">
                <span class="pay-detail-label">{{ t('pages.finance.debt.principal') }}</span>
                <span class="pay-detail-value">Rp {{ formatRupiah(selectedDebt.amount) }}</span>
              </div>
              <div v-if="selectedDebt.fineAmount > 0" class="pay-detail-row">
                <span class="pay-detail-label">Denda ({{ selectedDebt.finePercent }}%)</span>
                <span class="pay-detail-value fine-color">Rp {{ formatRupiah(selectedDebt.fineAmount) }}</span>
              </div>
              <div class="pay-detail-row pay-detail-total">
                <span class="pay-detail-label">Total Bayar</span>
                <span class="pay-detail-value pay-total-value">Rp {{ formatRupiah(selectedDebt.totalDebt) }}</span>
              </div>
              <div class="pay-detail-wallet">
                <Icon name="mdi:wallet-outline" size="16" />
                <span>Dari Dompet: <strong>{{ getWalletName(selectedDebt.toWalletId) }}</strong></span>
                <span class="wallet-current-balance">Saldo: Rp {{ formatRupiah(getWalletBalance(selectedDebt.toWalletId)) }}</span>
              </div>
            </div>
            <div class="pay-dialog-actions">
              <button class="pay-dialog-btn pay-dialog-btn--cancel" @click="cancelPay">
                <Icon name="mdi:close-circle-outline" size="18" />
                <span>Batal</span>
              </button>
              <button class="pay-dialog-btn pay-dialog-btn--confirm" @click="confirmPay">
                <Icon name="mdi:check-circle" size="18" />
                <span>Ya, Bayar Sekarang</span>
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
  --debt-accent: #fbbf24;
  --debt-accent-dark: #f59e0b;
  --debt-accent-container: rgba(251, 191, 36, 0.12);
  --debt-warning: #f59e0b;
  --debt-warning-container: rgba(245, 158, 11, 0.12);

  min-height: 100vh;
  padding: 24px 20px 120px;
  color: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-surface);
  position: relative;
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

.history-btn:hover {
  background-color: var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface);
}

.history-btn:active {
  transform: scale(0.96);
}

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

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.summary-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-card.unpaid .summary-icon-wrap {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.summary-card.paid .summary-icon-wrap {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.summary-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.3px;
}

/* ========== EMPTY STATE ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon-bg {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background-color: var(--md-sys-color-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-outline);
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  font-size: 1rem;
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
  font-weight: 500;
}

/* ========== DEBT LIST & CARD ========== */
.debt-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.debt-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 22px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.debt-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--debt-accent), var(--debt-accent-dark));
  opacity: 0.3;
  transition: all 0.3s ease;
}

.debt-card--overdue::before {
  background: linear-gradient(90deg, var(--md-sys-color-error), var(--md-sys-color-error-container));
  opacity: 0.6;
}

.debt-card--overdue {
  border-color: color-mix(in srgb, var(--md-sys-color-error) 30%, var(--md-sys-color-outline-variant));
}

.debt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Card Header */
.debt-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.debt-cat-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.debt-cat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.debt-cat-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.debt-cat-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.debt-date {
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface-variant);
}

.debt-total-top {
  text-align: right;
  flex-shrink: 0;
}

.total-label {
  display: block;
  font-size: 0.7rem;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.total-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--debt-accent);
  font-variant-numeric: tabular-nums;
}

.debt-card--overdue .total-value {
  color: var(--md-sys-color-error);
}

/* ========== ROUTE ========== */
.debt-route {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 14px;
  margin-bottom: 16px;
}

.wallet-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  flex: 1;
  justify-content: center;
}

.wallet-chip.from {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.wallet-chip.to {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.route-arrow-icon {
  color: var(--md-sys-color-outline);
  flex-shrink: 0;
}

/* ========== BREAKDOWN ========== */
.debt-breakdown {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.breakdown-label {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
}

.breakdown-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
}

.fine-color {
  color: var(--debt-warning);
}

/* ========== MODERN TARGET SECTION ========== */
.debt-target-modern {
  background-color: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 0;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.debt-target-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary));
  opacity: 0.4;
}

.target-modern--overdue::before {
  background: linear-gradient(90deg, var(--md-sys-color-error), var(--debt-warning));
  opacity: 0.6;
}

/* Date Card */
.target-date-card {
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 12px 0;
}

.target-date-visual {
  flex-shrink: 0;
}

.date-block {
  width: 52px;
  height: 58px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--md-sys-color-surface-container), var(--md-sys-color-surface));
  border: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.date-block::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 18px;
  background: var(--md-sys-color-primary);
  opacity: 0.12;
}

.date-block--accent::before {
  background: var(--debt-accent);
  opacity: 0.2;
}

.target-modern--overdue .date-block--accent::before {
  background: var(--md-sys-color-error);
  opacity: 0.25;
}

.date-block-day {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--md-sys-color-on-surface);
  line-height: 1;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}

.date-block-month {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  margin-top: 2px;
}

.date-block--accent .date-block-month {
  color: var(--debt-accent-dark);
}

.target-modern--overdue .date-block--accent .date-block-month {
  color: var(--md-sys-color-error);
}

/* Date Info */
.target-date-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  padding: 2px 0;
}

.target-info-header {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.target-info-icon {
  color: var(--md-sys-color-on-surface-variant);
  opacity: 0.7;
}

.target-info-icon--accent {
  color: var(--debt-accent);
  opacity: 1;
}

.target-modern--overdue .target-info-icon--accent {
  color: var(--md-sys-color-error);
}

.target-info-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.target-custom-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.58rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background-color: var(--debt-accent-container);
  color: var(--debt-accent-dark);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-left: auto;
}

.target-edit-trigger {
  background: none;
  border: none;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.5;
  margin-left: 4px;
}

.target-edit-trigger:hover {
  background-color: var(--debt-accent-container);
  color: var(--debt-accent);
  opacity: 1;
}

.target-info-main {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  line-height: 1.3;
  letter-spacing: -0.1px;
}

.target-info-main--overdue {
  color: var(--md-sys-color-error);
}

.target-info-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
  opacity: 0.8;
}

/* Connector */
.target-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 0 25px;
  height: 20px;
  justify-content: center;
}

.connector-line {
  width: 1.5px;
  flex: 1;
  background: linear-gradient(to bottom, var(--md-sys-color-outline-variant), transparent);
}

.connector-line:last-child {
  background: linear-gradient(to top, var(--md-sys-color-outline-variant), transparent);
}

.connector-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--md-sys-color-primary);
  opacity: 0.5;
  margin: 2px 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent);
}

/* ========== EDIT COMPACT (tidak melebar) ========== */
.target-edit-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  width: 100%;
}

.edit-input-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.edit-input-icon {
  position: absolute;
  left: 8px;
  color: var(--debt-accent-dark);
  pointer-events: none;
  z-index: 1;
}

.edit-compact-input {
  width: 100%;
  min-width: 0;
  padding: 7px 8px 7px 28px;
  border: 1.5px solid var(--debt-accent);
  border-radius: 8px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.edit-compact-input:focus {
  border-color: var(--debt-accent-dark);
  box-shadow: 0 0 0 3px var(--debt-accent-container);
}

.edit-compact-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.compact-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.compact-btn--save {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.compact-btn--save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
}

.compact-btn--cancel {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.compact-btn--cancel:hover {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: transparent;
}

.compact-btn--reset {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.compact-btn--reset:hover {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-color: transparent;
}

/* ========== COUNTDOWN BAR ========== */
.countdown-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.countdown-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background: linear-gradient(135deg, currentColor, transparent);
  pointer-events: none;
}

.countdown-bar--safe {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.countdown-bar--soon {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
}

.countdown-bar--urgent {
  background-color: var(--debt-warning-container);
  color: var(--debt-warning);
}

.countdown-bar--overdue {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.countdown-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.countdown-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
}

.countdown-pulse--active {
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.countdown-bar-icon {
  flex-shrink: 0;
}

.countdown-bar-label {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.countdown-bar-right {
  flex-shrink: 0;
}

.countdown-timer {
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-variant-numeric: tabular-nums;
  background-color: rgba(0, 0, 0, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
}

.timer-segment {
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.5px;
  min-width: 1.3ch;
  text-align: center;
}

.timer-segment--seconds {
  opacity: 0.85;
}

.timer-sep {
  font-size: 0.85rem;
  font-weight: 800;
  opacity: 0.6;
  margin: 0 1px;
  animation: blinkSep 1s step-end infinite;
}

@keyframes blinkSep {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.2; }
}

/* ========== DESCRIPTION ========== */
.debt-description {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 16px;
}

.desc-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

/* ========== PAY BTN (Konsisten dengan tema) ========== */
.pay-btn {
  width: 100%;
  padding: 14px;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
}

.pay-btn:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 85%, black);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
}

.pay-btn:active {
  transform: scale(0.97);
}

/* ========== HISTORY MODAL (z-index: 999) ========== */
.history-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.history-modal {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  animation: scaleIn 0.3s cubic-bezier(0.175, 0.8, 0.32, 1.275);
}

.history-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-shrink: 0;
}

.history-modal-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.history-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--md-sys-color-surface-variant);
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.history-close-btn:hover {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
}

.history-modal-body {
  padding: 16px 24px 24px;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 16px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 14px;
  margin-bottom: 10px;
  gap: 12px;
}

.history-item-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.history-cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-item-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.history-item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-timeline-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-timeline-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  width: 48px;
  flex-shrink: 0;
  opacity: 0.7;
}

.history-timeline-value {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
}

.history-settlement-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  width: fit-content;
  margin-top: 2px;
}

.settlement--ontime {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.settlement--overdue {
  background-color: var(--debt-warning-container);
  color: var(--debt-warning);
}

.history-item-right {
  text-align: right;
  flex-shrink: 0;
}

.history-item-amount {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
}

.history-item-wallet {
  font-size: 0.7rem;
  color: var(--md-sys-color-on-surface-variant);
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

.history-empty-icon {
  opacity: 0.4;
  margin-bottom: 16px;
  color: var(--md-sys-color-outline);
}

/* ========== PAY DIALOG (z-index: 1000, di bawah toast notification) ========== */
.pay-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.pay-dialog {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: dialogSlideUp 0.3s cubic-bezier(0.175, 0.8, 0.32, 1.275);
  color: var(--md-sys-color-on-surface);
}

.pay-dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.pay-dialog-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
}

.pay-dialog-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pay-dialog-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.pay-dialog-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
}

.pay-dialog-body {
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.pay-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.pay-detail-row + .pay-detail-row {
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.pay-detail-total {
  border-top: 2px solid var(--md-sys-color-primary) !important;
  margin-top: 8px;
  padding-top: 12px;
}

.pay-detail-label {
  font-size: 0.88rem;
  color: var(--md-sys-color-on-surface-variant);
}

.pay-detail-value {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
}

.pay-total-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--md-sys-color-primary);
}

.pay-detail-wallet {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background-color: var(--md-sys-color-surface-container);
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--md-sys-color-on-surface-variant);
  flex-wrap: wrap;
}

.wallet-current-balance {
  font-size: 0.8rem;
  color: var(--md-sys-color-primary);
  font-weight: 600;
  margin-left: auto;
}

/* Dialog Actions */
.pay-dialog-actions {
  display: flex;
  gap: 12px;
}

.pay-dialog-btn {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.pay-dialog-btn--cancel {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.pay-dialog-btn--cancel:hover {
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: transparent;
}

.pay-dialog-btn--confirm {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
}

.pay-dialog-btn--confirm:hover {
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 85%, black);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--md-sys-color-primary) 50%, transparent);
}

.pay-dialog-btn--confirm:active {
  transform: scale(0.97);
}

/* ========== ANIMATIONS ========== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes dialogSlideUp {
  from { transform: translateY(30px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 480px) {
  .debt-page {
    padding: 20px 14px 110px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .history-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .history-label {
    display: none;
  }

  .summary-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .debt-card {
    padding: 18px;
  }

  .debt-card-header {
    flex-direction: column;
    gap: 12px;
  }

  .debt-total-top {
    text-align: left;
  }

  .history-modal {
    max-width: 100%;
    margin: 0 10px;
  }

  .date-block {
    width: 46px;
    height: 52px;
  }

  .date-block-day {
    font-size: 1.1rem;
  }

  .target-info-main {
    font-size: 0.78rem;
  }

  .countdown-bar {
    padding: 8px 10px;
    gap: 8px;
  }

  .countdown-bar-label {
    font-size: 0.75rem;
  }

  .timer-segment {
    font-size: 0.82rem;
  }

  .target-edit-compact {
    flex-wrap: nowrap;
    gap: 6px;
  }

  .edit-compact-input {
    font-size: 0.72rem;
    padding: 6px 6px 6px 24px;
  }

  .compact-btn {
    width: 26px;
    height: 26px;
  }

  .pay-dialog {
    padding: 20px;
  }

  .pay-dialog-actions {
    flex-direction: column;
    gap: 10px;
  }

  .pay-dialog-btn {
    width: 100%;
  }

  .history-item {
    flex-direction: column;
  }

  .history-item-right {
    text-align: left;
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>

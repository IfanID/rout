<script setup>
import { ref, computed, onMounted } from 'vue'

const { t } = useI18n()

const isHidden = ref(false)
const progressFill = ref(0)
const progressExpense = ref(0)

// === SUMBER DATA UTAMA ===
const originals = ref({
  total: '4.300.000',
  income: '4.500.000',
  expense: '200.000'
})

function mask(text) {
  return text.replace(/\d/g, 'x')
}

const maskedTotal = computed(() => mask(originals.value.total))
const maskedIncome = computed(() => mask(originals.value.income))
const maskedExpense = computed(() => mask(originals.value.expense))

// === HITUNG PERSENTASE OTOMATIS ===
const incomePercent = computed(() => {
  const inc = parseInt(originals.value.income.replace(/\./g, ''), 10) || 0
  const exp = parseInt(originals.value.expense.replace(/\./g, ''), 10) || 0
  const total = inc + exp
  return total === 0 ? 0 : Math.round((inc / total) * 100)
})

const expensePercent = computed(() => {
  return 100 - incomePercent.value
})

function toggleVisibility() {
  isHidden.value = !isHidden.value
}

onMounted(() => {
  setTimeout(() => {
    progressFill.value = incomePercent.value
    progressExpense.value = expensePercent.value
  }, 600)
})
</script>

<template>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <p class="header-greeting">{{ t('pages.finance.analytics.greeting') }}</p>
      <h1 class="header-title">Juni 2026</h1>
    </header>

    <!-- Card -->
    <section class="card">
      <!-- Total Saldo -->
      <div class="total-saldo">
        <div class="total-saldo-label">{{ t('pages.finance.analytics.total_saldo') }}</div>
        <div class="total-saldo-wrapper">
          <div class="total-saldo-amount">
            <span class="currency">Rp</span> {{ isHidden ? maskedTotal : originals.total }}
          </div>
          <button
            class="hide-icon"
            :aria-label="isHidden ? t('pages.finance.analytics.show') : t('pages.finance.analytics.hide')"
            @click="toggleVisibility"
          >
            <Icon 
              :name="isHidden ? 'material-symbols:visibility-off-rounded' : 'material-symbols:visibility-rounded'" 
              size="24" 
              class="icon-eye"
            />
          </button>
        </div>
      </div>

      <!-- Inner Card -->
      <div class="card-inner">
        <div class="income-expense">
          <div class="income-box">
            <div class="income-label">
              <div class="icon-badge icon-badge-income">
                <Icon name="material-symbols:arrow-downward-rounded" size="16" class="icon-income-color" />
              </div>
              <span class="label-text">{{ t('pages.finance.analytics.income') }}</span>
            </div>
            <div class="income-amount">
              <span class="currency">Rp</span> {{ isHidden ? maskedIncome : originals.income }}
            </div>
          </div>

          <div class="separator-line"></div>

          <div class="expense-box">
            <div class="expense-label">
              <span class="label-text">{{ t('pages.finance.analytics.expense') }}</span>
              <div class="icon-badge icon-badge-expense">
                <Icon name="material-symbols:arrow-upward-rounded" size="16" class="icon-expense-color" />
              </div>
            </div>
            <div class="expense-amount">
              <span class="currency">Rp</span> {{ isHidden ? maskedExpense : originals.expense }}
            </div>
          </div>
        </div>

        <div class="bottom-row">
          <div class="income-percent">{{ incomePercent }}%</div>
          <div class="vs-separator">
            <span class="vs-text">{{ t('pages.finance.analytics.vs') }}</span>
          </div>
          <div class="expense-percent">{{ expensePercent }}%</div>
        </div>

        <div class="progress-bar-container">
          <div class="progress-fill" :style="{ width: progressFill + '%' }"></div>
          <div class="progress-expense" :style="{ width: progressExpense + '%' }"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.container {
  min-height: 100vh;
  padding: 24px;
  padding-bottom: 120px; 
  max-width: 640px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* === HEADER === */
.header {
  padding: 4px 4px 28px;
  animation: enterUp 500ms cubic-bezier(0.05, 0.7, 0.1, 1) both;
}

.header-greeting {
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.5px;
  color: var(--md-sys-color-on-surface-variant);
}

.header-title {
  font-size: 36px;
  line-height: 44px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* === CARD UTAMA === */
.card {
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 96%, var(--md-sys-color-primary) 4%);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 20%, transparent); 
  border-radius: 28px;
  padding: 28px;
  box-shadow: 
    0 1px 3px -1px rgba(0, 0, 0, 0.1),
    0 4px 12px -2px rgba(0, 0, 0, 0.15);
  animation: enterUp 500ms cubic-bezier(0.05, 0.7, 0.1, 1) 60ms both;
  transition:
    box-shadow 300ms cubic-bezier(0.2, 0, 0, 1),
    transform 300ms cubic-bezier(0.2, 0, 0, 1);
}

.card:hover {
  box-shadow: 
    0 2px 6px -2px rgba(0, 0, 0, 0.1),
    0 8px 16px -4px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* === TOTAL SALDO === */
.total-saldo {
  margin-bottom: 24px;
}

.total-saldo-label {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.total-saldo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-saldo-amount {
  font-size: 36px;
  line-height: 44px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  flex: 1;
  min-width: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
}

.currency {
  color: var(--md-sys-color-on-surface-variant);
  margin-right: 4px;
}

/* === TOMBOL HIDE === */
.hide-icon {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  background: color-mix(in srgb, var(--md-sys-color-surface-variant) 50%, transparent);
  border: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 200ms cubic-bezier(0.2, 0, 0, 1);
}

.hide-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
  pointer-events: none;
}

.hide-icon:hover { background: color-mix(in srgb, var(--md-sys-color-surface-variant) 80%, transparent); }
.hide-icon:hover::before { opacity: 0.08; }
.hide-icon:focus-visible::before { opacity: 0.12; }
.hide-icon:active::before { opacity: 0.12; }
.hide-icon:active { transform: scale(0.9); transition-duration: 100ms; }

.hide-icon:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.icon-eye {
  position: relative;
  z-index: 1;
  color: var(--md-sys-color-on-surface-variant);
  transition: color 200ms cubic-bezier(0.2, 0, 0, 1);
}

.hide-icon:hover .icon-eye {
  color: var(--md-sys-color-on-surface);
}

/* === CARD INNER === */
.card-inner {
  background: var(--md-sys-color-surface-container);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 15%, transparent);
  border-radius: 20px;
  padding: 24px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* === PEMISAHAN PEMASUKAN & PENGELUARAN === */
.income-expense {
  display: flex;
  align-items: stretch;
  margin-bottom: 24px;
}

.income-box,
.expense-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.income-box { text-align: left; padding-right: 24px; }
.expense-box { text-align: right; padding-left: 24px; }

.separator-line {
  width: 1px;
  background: linear-gradient(
    to bottom, 
    transparent, 
    var(--md-sys-color-outline-variant) 10%, 
    var(--md-sys-color-outline-variant) 50%, 
    var(--md-sys-color-outline-variant) 10%, 
    transparent
  );
  align-self: stretch;
  margin: 0 12px;
}

.income-label,
.expense-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.expense-label { justify-content: flex-end; }

.label-text {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
}

.icon-badge {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.icon-income-color { color: var(--md-sys-color-primary); }
.icon-expense-color { color: var(--md-sys-color-error); }

.income-amount,
.expense-amount {
  font-size: 22px;
  line-height: 28px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
}

/* === BAR VS DAN PERSEN === */
.bottom-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.income-percent {
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.1px;
  font-weight: 600;
  color: var(--md-sys-color-primary);
  text-align: left;
}

.vs-separator {
  position: relative;
  width: 44px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0 8px;
}

.vs-separator::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background-color: var(--md-sys-color-outline-variant);
}

.vs-text {
  position: relative;
  z-index: 1;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  padding: 2px 12px;
  border-radius: 6px;
}

.expense-percent {
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.1px;
  font-weight: 600;
  color: var(--md-sys-color-error);
  text-align: right;
}

/* === PROGRESS BAR === */
.progress-bar-container {
  display: flex;
  height: 10px;
  background: var(--md-sys-color-surface-variant);
  border-radius: 9999px;
  overflow: hidden;
  box-shadow: inset 0 0.5px 1px rgba(0, 0, 0, 0.25);
}

.progress-fill {
  height: 100%;
  background: var(--md-sys-color-primary);
  flex-shrink: 0;
  box-shadow: 0 0 8px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
  transition: width 800ms cubic-bezier(0.05, 0.7, 0.1, 1);
}

.progress-expense {
  height: 100%;
  background: var(--md-sys-color-error);
  flex-shrink: 0;
  box-shadow: 0 0 8px color-mix(in srgb, var(--md-sys-color-error) 40%, transparent);
  transition: width 800ms cubic-bezier(0.05, 0.7, 0.1, 1) 100ms;
}

/* === ANIMASI === */
@keyframes enterUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === RESPONSIVE === */
@media (max-width: 480px) {
  .container { padding: 16px; padding-bottom: 120px; }
  .header-title { font-size: 28px; line-height: 36px; }
  .total-saldo-amount { font-size: 28px; line-height: 36px; }
  .card { padding: 20px; }
  .card-inner { padding: 20px; }
  .income-amount, .expense-amount { font-size: 18px; line-height: 24px; }
  .icon-badge { width: 24px; height: 24px; border-radius: 6px; }
}
</style>
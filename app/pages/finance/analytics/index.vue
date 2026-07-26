<script setup lang="ts">
import { useFinanceStore } from '~/composables/finance/useFinanceStore'
import { useFinanceCategories } from '~/composables/finance/useFinanceCategories'

const { t } = useI18n()
const { transactions } = useFinanceStore()
const { getCategoryById } = useFinanceCategories()

const period = ref<'minggu' | 'bulan' | 'tahun'>('bulan')

/* ========== Period Filtering ========== */
const filteredTransactions = computed(() => {
  const now = new Date()
  let start: Date

  if (period.value === 'minggu') {
    start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
  } else if (period.value === 'bulan') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    start = new Date(now.getFullYear(), 0, 1)
  }

  return (transactions.value || []).filter((tx: any) => {
    const d = new Date(tx.createdAt)
    return d >= start
  })
})

/* ========== Summary ========== */
const summary = computed(() => {
  const txs = filteredTransactions.value
  const income = txs
    .filter((t: any) => t.type === 'income')
    .reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0)
  const expense = txs
    .filter((t: any) => t.type === 'expense')
    .reduce((s: number, t: any) => s + (Number(t.amount) || 0), 0)
  return {
    income,
    expense,
    balance: income - expense,
    transactions: txs.length,
  }
})

/* ========== Category Breakdown (income & expense) ========== */
function buildCategoryBreakdown(typeFilter: string) {
  const txs = filteredTransactions.value.filter((t: any) => t.type === typeFilter)
  const map = new Map<string, { amount: number; color: string; order: number }>()

  txs.forEach((tx: any) => {
    const cat = getCategoryById(tx.categoryId)
    const key = tx.categoryId || `other_${typeFilter}`
    const existing = map.get(key)
    const amt = Number(tx.amount) || 0
    if (existing) {
      existing.amount += amt
    } else {
      map.set(key, {
        amount: amt,
        color: cat?.color || '#9ca3af',
        order: typeof cat?.order === 'number' ? cat.order : 999,
      })
    }
  })

  return Array.from(map.entries())
    .map(([id, data]) => {
      const cat = getCategoryById(id)
      return {
        label: cat ? t(cat.labelKey) : id,
        amount: data.amount,
        stroke: data.color,
        order: data.order,
      }
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => a.order - b.order)
}

const categoryIncome = computed(() => {
  const result = buildCategoryBreakdown('income')
  return result.length > 0
    ? result
    : [{ label: '-', amount: 0, stroke: '#9ca3af', order: 999 }]
})

const categoryExpenses = computed(() => {
  const result = buildCategoryBreakdown('expense')
  return result.length > 0
    ? result
    : [{ label: '-', amount: 0, stroke: '#9ca3af', order: 999 }]
})

const maxIncome = computed(() =>
  Math.max(...categoryIncome.value.map((c) => c.amount), 0),
)

const maxExpense = computed(() =>
  Math.max(...categoryExpenses.value.map((c) => c.amount), 0),
)

/* ========== Donut Hover ========== */
const hoveredIndex = ref<number | null>(null)
const hoveredChart = ref<'expense' | 'income'>('expense')

const hoveredCategory = computed(() => {
  if (hoveredIndex.value === null) return null
  const list = hoveredChart.value === 'expense' ? categoryExpenses.value : categoryIncome.value
  return list[hoveredIndex.value] ?? null
})

const donutTotal = computed(() =>
  hoveredChart.value === 'expense' ? summary.value.expense : summary.value.income,
)

function pct(n: number): string {
  if (donutTotal.value === 0) return '0%'
  return ((n / donutTotal.value) * 100).toFixed(0) + '%'
}

/* ========== Helpers ========== */
function formatShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`
  return n.toString()
}
</script>

<template>
  <div class="analytics-page">
    <div class="analytics-bg-glow" />

    <div class="analytics-container">

      <!-- Header -->
      <div class="analytics-header">
        <div class="analytics-header-left">
          <h1 class="analytics-title">Finance Analytics</h1>
          <p class="analytics-subtitle">Ringkasan keuangan kamu bulan ini</p>
        </div>
        <div class="period-selector">
          <button
            v-for="p in (['minggu', 'bulan', 'tahun'] as const)"
            :key="p"
            type="button"
            :aria-label="`Periode ${p}`"
            :class="['period-btn', { 'period-btn--active': period === p }]"
            @click="period = p"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <!-- HERO: Donut Chart -->
      <div class="donut-card">
        <div class="donut-card__inner">
          <!-- Chart Type Toggle -->
          <div class="chart-toggle">
            <button
              :class="['chart-toggle__btn', { 'chart-toggle__btn--active': hoveredChart === 'expense' }]"
              @click="hoveredChart = 'expense'; hoveredIndex = null"
            >Pengeluaran</button>
            <button
              :class="['chart-toggle__btn', { 'chart-toggle__btn--active': hoveredChart === 'income' }]"
              @click="hoveredChart = 'income'; hoveredIndex = null"
            >Pemasukan</button>
          </div>

          <div class="donut-center-col">
            <div class="donut-wrap">
              <div class="donut-glow" />
              <svg viewBox="0 0 36 36" class="donut-svg">
                <circle
                  v-for="(cat, i) in (hoveredChart === 'expense' ? categoryExpenses : categoryIncome)"
                  :key="cat.label"
                  cx="18" cy="18" r="14" fill="none"
                  :stroke="cat.stroke"
                  :stroke-width="hoveredIndex === i ? 5.5 : 3.5"
                  :stroke-dasharray="`${(cat.amount / donutTotal) * 87.96} 87.96`"
                  :stroke-dashoffset="`${-(hoveredChart === 'expense' ? categoryExpenses : categoryIncome).slice(0, i).reduce((s, c) => s + (c.amount / donutTotal) * 87.96, 0)}`"
                  class="donut-segment"
                  :style="{ filter: hoveredIndex === i ? `drop-shadow(0 0 6px ${cat.stroke}80)` : 'none' }"
                  @mouseenter="hoveredIndex = i"
                  @mouseleave="hoveredIndex = null"
                />
              </svg>
              <div class="donut-center">
                <template v-if="hoveredCategory">
                  <div
                    class="donut-center__icon-bg"
                    :style="{ backgroundColor: hoveredCategory.stroke + '20' }"
                  >
                    <div
                      class="donut-center__icon-dot"
                      :style="{ backgroundColor: hoveredCategory.stroke, boxShadow: `0 0 8px ${hoveredCategory.stroke}60` }"
                    />
                  </div>
                  <span class="donut-center__cat-name">{{ hoveredCategory.label }}</span>
                  <span class="donut-center__cat-pct">{{ pct(hoveredCategory.amount) }}</span>
                  <span class="donut-center__cat-amount">{{ formatShort(hoveredCategory.amount) }}</span>
                </template>
                <template v-else>
                  <span class="donut-center__default-label">{{ hoveredChart === 'expense' ? 'Total Pengeluaran' : 'Total Pemasukan' }}</span>
                  <span class="donut-center__default-value">{{ formatShort(donutTotal) }}</span>
                </template>
              </div>
            </div>

            <!-- Summary Mini -->
            <div class="summary-mini">
              <div class="summary-mini__item">
                <div class="summary-mini__dot-row">
                  <div class="summary-mini__dot summary-mini__dot--green" />
                  <span class="summary-mini__dot-label">Masuk</span>
                </div>
                <span class="summary-mini__value">{{ formatShort(summary.income) }}</span>
              </div>
              <div class="summary-mini__divider" />
              <div class="summary-mini__item">
                <div class="summary-mini__dot-row">
                  <div class="summary-mini__dot summary-mini__dot--red" />
                  <span class="summary-mini__dot-label">Keluar</span>
                </div>
                <span class="summary-mini__value">{{ formatShort(summary.expense) }}</span>
              </div>
              <div class="summary-mini__divider" />
              <div class="summary-mini__item">
                <div class="summary-mini__dot-row">
                  <div class="summary-mini__dot summary-mini__dot--indigo" />
                  <span class="summary-mini__dot-label">Saldo</span>
                </div>
                <span class="summary-mini__value">{{ formatShort(summary.balance) }}</span>
              </div>
            </div>
          </div>

          <!-- Legend Grid -->
          <div class="legend-grid">
            <div
              v-for="(cat, i) in (hoveredChart === 'expense' ? categoryExpenses : categoryIncome)"
              :key="cat.label"
              :class="['legend-item', { 'legend-item--active': hoveredIndex === i }]"
              @mouseenter="hoveredIndex = i"
              @mouseleave="hoveredIndex = null"
            >
              <div
                :class="['legend-dot', { 'legend-dot--active': hoveredIndex === i }]"
                :style="{ backgroundColor: cat.stroke, boxShadow: hoveredIndex === i ? `0 0 8px ${cat.stroke}60` : 'none' }"
              />
              <div class="legend-text">
                <p class="legend-label">{{ cat.label }}</p>
                <p class="legend-value">{{ pct(cat.amount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart: Pemasukan -->
      <div v-if="categoryIncome.some(c => c.amount > 0)" class="bar-card">
        <h2 class="section-title">Pemasukan per Kategori</h2>
        <div class="bar-list">
          <div v-for="cat in categoryIncome" :key="cat.label" class="bar-row">
            <div class="bar-label">{{ cat.label }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${(cat.amount / maxIncome) * 100}%`, backgroundColor: cat.stroke }"
              >
                <span class="bar-text">{{ formatShort(cat.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart: Pengeluaran -->
      <div v-if="categoryExpenses.some(c => c.amount > 0)" class="bar-card">
        <h2 class="section-title">Pengeluaran per Kategori</h2>
        <div class="bar-list">
          <div v-for="cat in categoryExpenses" :key="cat.label" class="bar-row">
            <div class="bar-label">{{ cat.label }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: `${(cat.amount / maxExpense) * 100}%`, backgroundColor: cat.stroke }"
              >
                <span class="bar-text">{{ formatShort(cat.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ================================================
   VARIABLES
   ================================================ */

.analytics-page {
  --c-bg: #f8fafc;
  --c-surface: #ffffff;
  --c-surface-border: #e2e8f0;
  --c-surface-border-alt: #f1f5f9;
  --c-surface-hover: #f8fafc;
  --c-text-primary: #0f172a;
  --c-text-secondary: #64748b;
  --c-text-tertiary: #94a3b8;
  --c-text-muted: #94a3b8;
  --c-bar-track: #f1f5f9;
  --c-legend-hover: #f1f5f9;
  --c-legend-border: #e2e8f0;
  --c-summary-divider: #e2e8f0;
  --c-glow: #6366f1;
  --c-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --c-card-shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

  position: relative;
  z-index: 10;
  min-height: 100vh;
  background-color: var(--c-bg);
  overflow-x: hidden;
}

.dark .analytics-page {
  --c-bg: #020617;
  --c-surface: #0f172a;
  --c-surface-border: #1e293b;
  --c-surface-border-alt: #1e293b;
  --c-surface-hover: #1e293b;
  --c-text-primary: #f8fafc;
  --c-text-secondary: #94a3b8;
  --c-text-tertiary: #64748b;
  --c-text-muted: #64748b;
  --c-bar-track: #1e293b;
  --c-legend-hover: #1e293b;
  --c-legend-border: #334155;
  --c-summary-divider: #1e293b;
  --c-glow: #6366f1;
  --c-card-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
  --c-card-shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* ================================================
   BACKGROUND GLOW
   ================================================ */

.analytics-bg-glow {
  position: fixed;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--c-glow) 0%, transparent 70%);
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}

.dark .analytics-bg-glow {
  opacity: 0.06;
}

/* ================================================
   LAYOUT
   ================================================ */

.analytics-container {
  position: relative;
  z-index: 1;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

@media (min-width: 640px) {
  .analytics-container {
    padding: 2.5rem 1.5rem;
  }
}

/* ================================================
   HEADER
   ================================================ */

.analytics-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 640px) {
  .analytics-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.analytics-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--c-text-primary);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

@media (min-width: 640px) {
  .analytics-title {
    font-size: 1.875rem;
  }
}

.analytics-subtitle {
  color: var(--c-text-secondary);
  margin-top: 0.375rem;
  font-size: 0.875rem;
  font-weight: 400;
}

/* ================================================
   PERIOD SELECTOR
   ================================================ */

.period-selector {
  display: flex;
  background-color: var(--c-surface);
  border-radius: 0.75rem;
  padding: 4px;
  box-shadow: var(--c-card-shadow);
  border: 1px solid var(--c-surface-border);
  width: fit-content;
  text-transform: capitalize;
}

.period-btn {
  padding: 0.5rem 1.125rem;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--c-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;
}

.period-btn:hover {
  color: var(--c-text-primary);
  background-color: var(--c-surface-hover);
}

.period-btn--active {
  background-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}

/* ================================================
   CHART TOGGLE (Income / Expense)
   ================================================ */

.chart-toggle {
  display: flex;
  background-color: var(--c-surface-border-alt);
  border-radius: 0.75rem;
  padding: 4px;
  margin-bottom: 1.5rem;
  width: fit-content;
}

.chart-toggle__btn {
  padding: 0.5rem 1.25rem;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;
}

.chart-toggle__btn:hover {
  color: var(--c-text-primary);
}

.chart-toggle__btn--active {
  background-color: var(--c-surface);
  color: var(--c-text-primary);
  box-shadow: var(--c-card-shadow);
}

/* ================================================
   DONUT CARD (HERO)
   ================================================ */

.donut-card {
  background-color: var(--c-surface);
  border-radius: 1.25rem;
  border: 1px solid var(--c-surface-border);
  box-shadow: var(--c-card-shadow-lg);
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.donut-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #fb923c, #60a5fa, #c084fc, #34d399);
  opacity: 0.7;
}

.donut-card__inner {
  padding: 2rem 1.5rem;
}

@media (min-width: 640px) {
  .donut-card__inner {
    padding: 2.5rem;
  }
}

.donut-center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ================================================
   DONUT CHART
   ================================================ */

.donut-wrap {
  position: relative;
  width: 15rem;
  height: 15rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .donut-wrap {
    width: 19rem;
    height: 19rem;
  }
}

.donut-glow {
  position: absolute;
  inset: 15%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--c-glow) 0%, transparent 70%);
  opacity: 0.08;
  filter: blur(20px);
  pointer-events: none;
}

.dark .donut-glow {
  opacity: 0.12;
}

.donut-svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-segment {
  cursor: pointer;
  transition: stroke-width 200ms ease, filter 300ms ease;
}

/* ================================================
   DONUT CENTER
   ================================================ */

.donut-center {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-center__icon-bg {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: background-color 200ms ease;
}

.donut-center__icon-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  transition: background-color 200ms ease, box-shadow 300ms ease;
}

.donut-center__cat-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text-primary);
  transition: all 200ms ease;
  letter-spacing: -0.01em;
}

@media (min-width: 640px) {
  .donut-center__cat-name {
    font-size: 1.125rem;
  }
}

.donut-center__cat-pct {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--c-text-primary);
  letter-spacing: -0.03em;
  transition: all 200ms ease;
  line-height: 1.2;
}

@media (min-width: 640px) {
  .donut-center__cat-pct {
    font-size: 2rem;
  }
}

.donut-center__cat-amount {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  transition: all 200ms ease;
  margin-top: 2px;
}

.donut-center__default-label {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  margin-bottom: 0.375rem;
  transition: all 200ms ease;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-weight: 500;
}

@media (min-width: 640px) {
  .donut-center__default-label {
    font-size: 0.8125rem;
  }
}

.donut-center__default-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--c-text-primary);
  letter-spacing: -0.03em;
  transition: all 200ms ease;
  line-height: 1.1;
}

@media (min-width: 640px) {
  .donut-center__default-value {
    font-size: 2.5rem;
  }
}

/* ================================================
   SUMMARY MINI
   ================================================ */

.summary-mini {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.75rem;
  background-color: var(--c-surface-border-alt);
  border-radius: 1rem;
  border: 1px solid var(--c-surface-border);
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .summary-mini {
    gap: 2rem;
    padding: 1rem 2rem;
  }
}

.summary-mini__item {
  text-align: center;
}

.summary-mini__dot-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.summary-mini__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
}

.summary-mini__dot--green {
  background-color: #34d399;
  box-shadow: 0 0 6px rgba(52, 211, 153, 0.4);
}

.summary-mini__dot--red {
  background-color: #f87171;
  box-shadow: 0 0 6px rgba(248, 113, 113, 0.4);
}

.summary-mini__dot--indigo {
  background-color: #818cf8;
  box-shadow: 0 0 6px rgba(129, 140, 248, 0.4);
}

.summary-mini__dot-label {
  font-size: 0.6875rem;
  color: var(--c-text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary-mini__value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--c-text-primary);
  letter-spacing: -0.01em;
}

@media (min-width: 640px) {
  .summary-mini__value {
    font-size: 1.0625rem;
  }
}

.summary-mini__divider {
  width: 1px;
  height: 2rem;
  background-color: var(--c-summary-divider);
  opacity: 0.6;
}

/* ================================================
   LEGEND GRID (GAP TRICK)
   ================================================ */

.legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5px;
  background-color: var(--c-legend-border);
  border: 1.5px solid var(--c-legend-border);
  border-radius: 0.75rem;
  overflow: hidden;
  margin-top: 1.5rem;
}

@media (min-width: 640px) {
  .legend-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.875rem 1rem;
  background-color: var(--c-surface);
  transition: background-color 200ms ease, transform 150ms ease;
}

.legend-item:hover {
  background-color: var(--c-legend-hover);
}

.legend-item--active {
  background-color: var(--c-surface-hover);
  transform: scale(1.02);
}

.dark .legend-item--active {
  background-color: rgba(30, 41, 59, 0.8);
}

.legend-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.legend-dot--active {
  transform: scale(1.4);
}

.legend-text {
  min-width: 0;
  flex: 1;
}

.legend-label {
  font-size: 0.6875rem;
  color: var(--c-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-weight: 500;
}

.legend-value {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--c-text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

/* ================================================
   BAR CHART
   ================================================ */

.bar-card {
  background-color: var(--c-surface);
  border-radius: 1.25rem;
  padding: 1.5rem;
  border: 1px solid var(--c-surface-border);
  box-shadow: var(--c-card-shadow);
}

@media (min-width: 640px) {
  .bar-card {
    padding: 1.75rem;
  }
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--c-text-primary);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bar-label {
  width: 5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--c-text-tertiary);
  text-align: right;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .bar-label {
    width: 6rem;
  }
}

.bar-track {
  flex: 1;
  height: 2rem;
  background-color: var(--c-bar-track);
  border-radius: 0.625rem;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 0.625rem;
  transition: width 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.625rem;
  min-width: 2.25rem;
  position: relative;
}

.bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent);
  border-radius: 0.625rem 0.625rem 0 0;
  pointer-events: none;
}

.dark .bar-fill::after {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.06), transparent);
}

.bar-text {
  position: relative;
  z-index: 1;
  font-size: 0.625rem;
  font-weight: 700;
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  white-space: nowrap;
  letter-spacing: 0.01em;
}
</style>
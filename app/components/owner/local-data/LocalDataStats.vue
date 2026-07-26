<script setup lang="ts">
import { useLocalData } from '~/composables/owner/useLocalData'

const { stats, totalBalance, formatRupiah } = useLocalData()

const balanceAnimated = ref(0)
const statsVisible = ref(false)

const animateNumber = (target) => {
  if (!import.meta.client) {
    balanceAnimated.value = target
    return
  }

  const duration = 1200
  const startTime = Date.now()
  const startValue = balanceAnimated.value

  const step = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    balanceAnimated.value = Math.floor(startValue + (target - startValue) * eased)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}

watch(totalBalance, (newVal) => {
  if (import.meta.client) {
    animateNumber(newVal)
  } else {
    balanceAnimated.value = newVal
  }
})

onMounted(() => {
  balanceAnimated.value = totalBalance.value
  setTimeout(() => {
    statsVisible.value = true
    animateNumber(totalBalance.value)
  }, 100)
})

const maxAmount = computed(() => {
  return Math.max(stats.value.totalIncome, stats.value.totalExpense, 1)
})

const incomePercent = computed(() => (stats.value.totalIncome / maxAmount.value) * 100)
const expensePercent = computed(() => (stats.value.totalExpense / maxAmount.value) * 100)

const statItems = computed(() => [
  {
    id: 'wallets',
    label: 'Dompet',
    value: stats.value.totalWallets,
    displayValue: stats.value.totalWallets.toString(),
    icon: 'material-symbols:wallet-rounded',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    suffix: ''
  },
  {
    id: 'transactions',
    label: 'Transaksi',
    value: stats.value.totalTransactions,
    displayValue: stats.value.totalTransactions.toString(),
    icon: 'material-symbols:receipt-long-rounded',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    suffix: ''
  },
  {
    id: 'income',
    label: 'Pemasukan',
    value: stats.value.totalIncome,
    displayValue: 'Rp ' + formatRupiah(stats.value.totalIncome),
    icon: 'material-symbols:trending-up-rounded',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    suffix: '',
    hasBar: true,
    barPercent: incomePercent.value
  },
  {
    id: 'expense',
    label: 'Pengeluaran',
    value: stats.value.totalExpense,
    displayValue: 'Rp ' + formatRupiah(stats.value.totalExpense),
    icon: 'material-symbols:trending-down-rounded',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
    suffix: '',
    hasBar: true,
    barPercent: expensePercent.value
  },
  {
    id: 'debt',
    label: 'Hutang Aktif',
    value: stats.value.totalDebt,
    displayValue: stats.value.totalDebt.toString(),
    icon: 'material-symbols:payments-rounded',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    suffix: ' item'
  }
])
</script>

<template>
  <div class="stats-section">
    <!-- Main Balance Card -->
    <div class="balance-hero">
      <div class="hero-bg">
        <div class="hero-blob hero-blob-1"></div>
        <div class="hero-blob hero-blob-2"></div>
        <div class="hero-blob hero-blob-3"></div>
      </div>

      <div class="hero-content">
        <div class="hero-left">
          <div class="hero-label">
            <Icon name="material-symbols:account-balance-wallet-rounded" size="18" />
            <span>Total Saldo Keseluruhan</span>
          </div>
          <div class="hero-value-wrap">
            <span class="hero-currency">Rp</span>
            <span class="hero-value">{{ formatRupiah(balanceAnimated) }}</span>
          </div>
          <div class="hero-footer">
            <div class="hero-chip">
              <div class="chip-dot"></div>
              <span>Terhitung dari {{ stats.totalWallets }} dompet</span>
            </div>
            <div class="hero-chip storage">
              <Icon name="material-symbols:storage-rounded" size="14" />
              <span>{{ stats.storageUsed }}</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-ring">
            <svg viewBox="0 0 120 120" class="ring-svg">
              <circle cx="60" cy="60" r="52" class="ring-bg" />
              <circle
                cx="60" cy="60" r="52"
                class="ring-progress"
                :style="{ strokeDasharray: `${incomePercent * 3.27} 327` }"
              />
            </svg>
            <div class="ring-center">
              <div class="ring-icon">
                <Icon name="material-symbols:analytics-rounded" size="28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div
        v-for="(item, index) in statItems"
        :key="item.id"
        class="stat-card"
        :class="{ visible: statsVisible }"
        :style="{ '--delay': index * 0.08 + 's', '--accent': item.color }"
      >
        <div class="stat-card-bg" :style="{ background: item.gradient }"></div>

        <div class="stat-card-content">
          <div class="stat-header">
            <div class="stat-icon" :style="{ background: item.bgColor, color: item.color }">
              <Icon :name="item.icon" size="22" />
            </div>
            <span class="stat-label">{{ item.label }}</span>
          </div>

          <div class="stat-value-row">
            <span class="stat-value">{{ item.displayValue }}</span>
            <span v-if="item.suffix" class="stat-suffix">{{ item.suffix }}</span>
          </div>

          <div v-if="item.hasBar" class="stat-bar-wrap">
            <div class="stat-bar">
              <div
                class="stat-bar-fill"
                :style="{
                  width: statsVisible ? item.barPercent + '%' : '0%',
                  background: item.gradient
                }"
              ></div>
            </div>
            <span class="stat-bar-label" :style="{ color: item.color }">{{ Math.round(item.barPercent) }}%</span>
          </div>

          <div v-else class="stat-indicator" :style="{ background: item.bgColor, color: item.color }">
            <Icon name="material-symbols:trending-up-rounded" size="14" />
            <span>Aktif</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== HERO BALANCE ========== */
.balance-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #0c1222 100%);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 28px;
  padding: 32px;
  overflow: hidden;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(6, 182, 212, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.balance-hero:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 182, 212, 0.35);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(6, 182, 212, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}

.hero-blob-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  top: -100px;
  right: -50px;
  animation: blobMove1 12s ease-in-out infinite;
}

.hero-blob-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, #0891b2 0%, transparent 70%);
  bottom: -80px;
  left: 10%;
  animation: blobMove2 15s ease-in-out infinite;
}

.hero-blob-3 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  top: 40%;
  right: 30%;
  animation: blobMove3 10s ease-in-out infinite;
  opacity: 0.2;
}

@keyframes blobMove1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 30px) scale(1.15); }
}
@keyframes blobMove2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -20px) scale(1.1); }
}
@keyframes blobMove3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -30px) scale(0.9); }
}

.hero-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.hero-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(6, 182, 212, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #67e8f9;
  width: fit-content;
}

.hero-value-wrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1;
}

.hero-value {
  font-size: 2.8rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-shadow: 0 2px 20px rgba(6, 182, 212, 0.2);
}

.hero-footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #06b6d4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.6);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-chip.storage {
  background: rgba(6, 182, 212, 0.08);
  border-color: rgba(6, 182, 212, 0.15);
  color: #67e8f9;
}

/* Hero Visual Ring */
.hero-visual {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-ring {
  position: relative;
  width: 140px;
  height: 140px;
}

.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.25));
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.05);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: #06b6d4;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22d3ee;
  backdrop-filter: blur(10px);
}

/* ========== STATS GRID ========== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.stat-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(20px);
}

.stat-card.visible {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--delay);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

.stat-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.stat-card-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.stat-card:hover .stat-icon {
  transform: scale(1.08) rotate(-3deg);
}

.stat-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  word-break: break-word;
}

.stat-suffix {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

/* Progress Bar */
.stat-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-bar-label {
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 32px;
  text-align: right;
}

/* Indicator */
.stat-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  width: fit-content;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .balance-hero { padding: 24px; border-radius: 22px; }
  .hero-value { font-size: 2.2rem; }
  .hero-currency { font-size: 1.2rem; }
  .visual-ring { width: 110px; height: 110px; }
  .ring-icon { width: 52px; height: 52px; }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-content { flex-direction: column; text-align: center; }
  .hero-left { align-items: center; }
  .hero-value { font-size: 1.8rem; }
  .hero-footer { justify-content: center; }
  .stats-grid { grid-template-columns: 1fr; }
  .stat-value { font-size: 1.1rem; }
}
</style>

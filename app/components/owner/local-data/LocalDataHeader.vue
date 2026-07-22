<script setup>
const {
  t, stats, triggerImport, exportToJSON, showDeleteAllDialog
} = useLocalData()

const currentTime = ref('')

const updateTime = () => {
  if (!import.meta.client) return
  currentTime.value = new Date().toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 60000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="header-card">
    <!-- Decorative Elements -->
    <div class="header-decor">
      <div class="decor-circle decor-circle-1"></div>
      <div class="decor-circle decor-circle-2"></div>
      <div class="decor-grid"></div>
    </div>

    <!-- Header Content -->
    <div class="header-content">
      <div class="header-left">
        <div class="header-icon-wrap">
          <div class="icon-pulse"></div>
          <Icon name="material-symbols:database-rounded" size="32" class="main-icon" />
        </div>
        <div class="header-info">
          <div class="title-row">
            <h1 class="page-title">{{ t('pages.owner.local_data.title') }}</h1>
            <span class="version-badge">v1.0</span>
          </div>
          <p class="page-subtitle">
            <Icon name="material-symbols:info-outline" size="14" />
            Kelola data yang tersimpan di browser lokal
          </p>
          <div class="header-meta">
            <span class="meta-chip">
              <Icon name="material-symbols:schedule-rounded" size="14" />
              {{ currentTime || 'Memuat...' }}
            </span>
            <span class="meta-chip accent">
              <Icon name="material-symbols:storage-rounded" size="14" />
              {{ stats.storageUsed }} terpakai
            </span>
            <span class="meta-chip success">
              <Icon name="material-symbols:check-circle-rounded" size="14" />
              Tersinkron
            </span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button class="action-btn primary" @click="triggerImport" title="Impor data dari file JSON">
          <div class="btn-icon">
            <Icon name="material-symbols:upload-rounded" size="20" />
          </div>
          <div class="btn-text">
            <span class="btn-label">Impor</span>
            <span class="btn-hint">Dari JSON</span>
          </div>
        </button>
        <button class="action-btn primary" @click="exportToJSON" title="Ekspor semua data ke JSON">
          <div class="btn-icon">
            <Icon name="material-symbols:download-rounded" size="20" />
          </div>
          <div class="btn-text">
            <span class="btn-label">Ekspor</span>
            <span class="btn-hint">Ke JSON</span>
          </div>
        </button>
        <button class="action-btn danger" @click="showDeleteAllDialog = true" title="Hapus semua data">
          <div class="btn-icon">
            <Icon name="material-symbols:delete-sweep-rounded" size="20" />
          </div>
          <div class="btn-text">
            <span class="btn-label">Hapus</span>
            <span class="btn-hint">Semua Data</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Quick Stats Strip -->
    <div class="quick-stats">
      <div class="quick-stat">
        <Icon name="material-symbols:wallet-rounded" size="16" />
        <span>{{ stats.totalWallets }} Dompet</span>
      </div>
      <div class="stat-divider"></div>
      <div class="quick-stat">
        <Icon name="material-symbols:receipt-long-rounded" size="16" />
        <span>{{ stats.totalTransactions }} Transaksi</span>
      </div>
      <div class="stat-divider"></div>
      <div class="quick-stat">
        <Icon name="material-symbols:payments-rounded" size="16" />
        <span>{{ stats.totalDebt }} Hutang Aktif</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-card {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1222 100%);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 28px;
  padding: 28px;
  overflow: hidden;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 8px 32px rgba(6, 182, 212, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-card:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 16px 48px rgba(6, 182, 212, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Decorative */
.header-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
}

.decor-circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
  animation: float 8s ease-in-out infinite;
}

.decor-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: 20%;
  animation: float 10s ease-in-out infinite reverse;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 70%);
}

.decor-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -20px) scale(1.1); }
}

/* Content */
.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  flex: 1;
  min-width: 280px;
}

.header-icon-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow:
    0 4px 16px rgba(6, 182, 212, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.icon-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 24px;
  border: 2px solid rgba(6, 182, 212, 0.5);
  opacity: 0;
  animation: pulse 3s ease-out infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}

.main-icon {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.02em;
}

.version-badge {
  padding: 3px 10px;
  background: rgba(6, 182, 212, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #22d3ee;
  letter-spacing: 0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.2s;
}

.meta-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(6, 182, 212, 0.3);
  color: #cbd5e1;
  transform: translateY(-1px);
}

.meta-chip.accent {
  background: rgba(6, 182, 212, 0.1);
  border-color: rgba(6, 182, 212, 0.25);
  color: #22d3ee;
}

.meta-chip.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

/* Actions */
.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  white-space: nowrap;
  font-family: inherit;
}

.action-btn.primary {
  background: rgba(6, 182, 212, 0.12);
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.25);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.08);
}

.action-btn.primary:hover {
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.15);
}

.action-btn.primary:active {
  transform: translateY(0);
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.25);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);
}

.action-btn.danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.15);
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn.primary:hover .btn-icon {
  background: rgba(6, 182, 212, 0.15);
}

.action-btn.danger:hover .btn-icon {
  background: rgba(239, 68, 68, 0.15);
}

.btn-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  text-align: left;
}

.btn-label {
  font-weight: 700;
  font-size: 0.88rem;
  line-height: 1;
}

.btn-hint {
  font-size: 0.68rem;
  opacity: 0.6;
  font-weight: 500;
  line-height: 1;
}

/* Quick Stats Strip */
.quick-stats {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
  transition: all 0.2s;
}

.quick-stat:hover {
  background: rgba(6, 182, 212, 0.08);
  border-color: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
  transform: scale(1.03);
}

.stat-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .header-card { padding: 20px; border-radius: 22px; }
  .header-content { flex-direction: column; }
  .header-actions { width: 100%; }
  .action-btn {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    justify-content: center;
  }
  .btn-hint { display: none; }
  .btn-text { align-items: center; }
  .page-title { font-size: 1.35rem; }
  .header-icon-wrap { width: 56px; height: 56px; }
  .stat-divider { display: none; }
  .quick-stats { gap: 8px; }
  .quick-stat { padding: 6px 12px; font-size: 0.78rem; }
}

@media (max-width: 480px) {
  .header-meta { gap: 6px; }
  .meta-chip { padding: 4px 10px; font-size: 0.7rem; }
  .header-left { gap: 14px; }
}
</style>

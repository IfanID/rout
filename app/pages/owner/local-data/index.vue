<script setup>
const {
  isMounted, initMounted,
  showDeleteAllDialog, dialogConfig, deleteAll,
  toastMessage, toastVisible,
  importFromJSON, fileInputRef
} = useLocalData()

onMounted(() => {
  initMounted()
})
</script>

<template>
  <div class="local-data-page">
    <!-- ======================== -->
    <!-- SKELETON: SELURUH HALAMAN -->
    <!-- ======================== -->
    <template v-if="!isMounted">

      <!-- Skeleton Header -->
      <div class="skel-header">
        <div class="skel-header-decor">
          <div class="skel-decor-circle skel-decor-1"></div>
          <div class="skel-decor-circle skel-decor-2"></div>
        </div>

        <div class="skel-header-content">
          <div class="skel-header-left">
            <div class="skel-header-icon"></div>
            <div class="skel-header-info">
              <div class="skel-title-row">
                <div class="skel-line skel-line--title"></div>
                <div class="skel-badge"></div>
              </div>
              <div class="skel-line skel-line--subtitle"></div>
              <div class="skel-meta-chips">
                <div class="skel-chip"></div>
                <div class="skel-chip skel-chip--accent"></div>
                <div class="skel-chip skel-chip--success"></div>
              </div>
            </div>
          </div>

          <div class="skel-header-actions">
            <div class="skel-action-btn">
              <div class="skel-action-icon"></div>
              <div class="skel-action-text">
                <div class="skel-line skel-line--xs"></div>
                <div class="skel-line skel-line--xxs"></div>
              </div>
            </div>
            <div class="skel-action-btn">
              <div class="skel-action-icon"></div>
              <div class="skel-action-text">
                <div class="skel-line skel-line--xs"></div>
                <div class="skel-line skel-line--xxs"></div>
              </div>
            </div>
            <div class="skel-action-btn skel-action-btn--danger">
              <div class="skel-action-icon"></div>
              <div class="skel-action-text">
                <div class="skel-line skel-line--xs"></div>
                <div class="skel-line skel-line--xxs"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="skel-quick-stats">
          <div class="skel-quick-stat">
            <div class="skel-circle skel-circle--xs"></div>
            <div class="skel-line skel-line--qs"></div>
          </div>
          <div class="skel-qs-divider"></div>
          <div class="skel-quick-stat">
            <div class="skel-circle skel-circle--xs"></div>
            <div class="skel-line skel-line--qs"></div>
          </div>
          <div class="skel-qs-divider"></div>
          <div class="skel-quick-stat">
            <div class="skel-circle skel-circle--xs"></div>
            <div class="skel-line skel-line--qs"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Hero Balance -->
      <div class="skel-hero">
        <div class="skel-hero-decor">
          <div class="skel-hero-blob skel-hero-blob-1"></div>
          <div class="skel-hero-blob skel-hero-blob-2"></div>
        </div>
        <div class="skel-hero-content">
          <div class="skel-hero-left">
            <div class="skel-hero-label">
              <div class="skel-circle skel-circle--xs"></div>
              <div class="skel-line skel-line--hero-label"></div>
            </div>
            <div class="skel-hero-value">
              <div class="skel-currency">Rp</div>
              <div class="skel-line skel-line--balance"></div>
            </div>
            <div class="skel-hero-chips">
              <div class="skel-hero-chip">
                <div class="skel-dot"></div>
                <div class="skel-line skel-line--chip"></div>
              </div>
              <div class="skel-hero-chip">
                <div class="skel-circle skel-circle--xs"></div>
                <div class="skel-line skel-line--chip"></div>
              </div>
            </div>
          </div>
          <div class="skel-hero-ring"></div>
        </div>
      </div>

      <!-- Skeleton Stats Grid (5 cards) -->
      <div class="skel-stats-grid">
        <div v-for="i in 5" :key="i" class="skel-stat-card">
          <div class="skel-bar skel-bar--accent"></div>
          <div class="skel-stat-body">
            <div class="skel-stat-header">
              <div class="skel-circle"></div>
              <div class="skel-line skel-line--short"></div>
            </div>
            <div class="skel-line skel-line--value"></div>
            <div class="skel-line skel-line--bar"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Wallet Section -->
      <div class="skel-section">
        <div class="skel-section-header">
          <div class="skel-circle skel-circle--icon"></div>
          <div class="skel-section-title">
            <div class="skel-line skel-line--title"></div>
            <div class="skel-line skel-line--subtitle"></div>
          </div>
          <div class="skel-btn"></div>
        </div>
        <div class="skel-wallet-grid">
          <div v-for="i in 2" :key="i" class="skel-wallet-card">
            <div class="skel-wallet-top">
              <div class="skel-avatar"></div>
              <div class="skel-wallet-info">
                <div class="skel-line skel-line--name"></div>
                <div class="skel-line skel-line--type"></div>
              </div>
            </div>
            <div class="skel-line skel-line--balance"></div>
            <div class="skel-wallet-stats">
              <div class="skel-line skel-line--stat"></div>
              <div class="skel-line skel-line--stat"></div>
              <div class="skel-line skel-line--stat"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton Transactions Section -->
      <div class="skel-section">
        <div class="skel-section-header">
          <div class="skel-circle skel-circle--icon"></div>
          <div class="skel-section-title">
            <div class="skel-line skel-line--title"></div>
            <div class="skel-line skel-line--subtitle"></div>
          </div>
          <div class="skel-btn"></div>
        </div>
        <div class="skel-trans-list">
          <div v-for="i in 5" :key="i" class="skel-trans-item">
            <div class="skel-trans-left">
              <div class="skel-circle skel-circle--sm"></div>
              <div class="skel-trans-info">
                <div class="skel-line skel-line--name"></div>
                <div class="skel-line skel-line--meta"></div>
              </div>
            </div>
            <div class="skel-line skel-line--amount"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Management Section -->
      <div class="skel-section">
        <div class="skel-section-header">
          <div class="skel-circle skel-circle--icon"></div>
          <div class="skel-section-title">
            <div class="skel-line skel-line--title"></div>
            <div class="skel-line skel-line--subtitle"></div>
          </div>
        </div>
        <div class="skel-management-list">
          <div v-for="i in 4" :key="i" class="skel-management-item">
            <div class="skel-mgmt-left">
              <div class="skel-circle skel-circle--sm"></div>
              <div class="skel-mgmt-info">
                <div class="skel-line skel-line--name"></div>
                <div class="skel-line skel-line--desc"></div>
              </div>
            </div>
            <div class="skel-toggle"></div>
          </div>
        </div>
      </div>

      <!-- Skeleton Storage Section -->
      <div class="skel-section">
        <div class="skel-section-header">
          <div class="skel-circle skel-circle--icon"></div>
          <div class="skel-section-title">
            <div class="skel-line skel-line--title"></div>
            <div class="skel-line skel-line--subtitle"></div>
          </div>
        </div>
        <div class="skel-storage-list">
          <div v-for="i in 2" :key="i" class="skel-storage-item">
            <div class="skel-storage-left">
              <div class="skel-circle skel-circle--sm"></div>
              <div class="skel-storage-info">
                <div class="skel-line skel-line--name"></div>
                <div class="skel-line skel-line--key"></div>
              </div>
            </div>
            <div class="skel-line skel-line--size"></div>
          </div>
        </div>
      </div>

    </template>

    <!-- ======================== -->
    <!-- KONTEN ASLI              -->
    <!-- ======================== -->
    <template v-else>
      <OwnerLocalDataHeader />
      <OwnerLocalDataStats />
      <OwnerLocalDataWallets />
      <OwnerLocalDataTransactions />
      <OwnerLocalDataManagement />
    </template>

    <!-- Dialog: Confirm (Global) -->
    <Teleport to="body">
      <div v-if="dialogConfig.show" class="dialog-overlay">
        <ConfirmDialog
          :title="dialogConfig.title"
          :message="dialogConfig.message"
          :confirmText="dialogConfig.confirmText"
          :cancelText="dialogConfig.cancelText"
          @confirm="dialogConfig.onConfirm?.(); dialogConfig.show = false"
          @cancel="dialogConfig.show = false"
        />
      </div>
    </Teleport>

    <!-- Dialog: Delete All -->
    <Teleport to="body">
      <div v-if="showDeleteAllDialog" class="dialog-overlay">
        <ConfirmDialog
          title="Hapus Semua Data?"
          message="Tindakan ini akan menghapus SEMUA data wallet, transaksi, dan pengaturan dari browser. Tindakan tidak dapat dibatalkan."
          confirmText="Ya, Hapus Semua"
          cancelText="Batal"
          @confirm="deleteAll"
          @cancel="showDeleteAllDialog = false"
        />
      </div>
    </Teleport>

    <!-- Toast (Global) -->
    <Transition name="toast">
      <div v-if="toastVisible" class="toast">
        <Icon name="material-symbols:check-circle-rounded" size="20" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Hidden file input -->
    <input ref="fileInputRef" type="file" accept=".json" style="display: none" @change="importFromJSON" />
  </div>
</template>

<style scoped>
.local-data-page {
  padding: 24px 16px 120px;
  color: var(--md-sys-color-on-surface);
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ============================== */
/* DIALOG & TOAST                 */
/* ============================== */
.dialog-overlay {
  position: fixed; inset: 0; z-index: 20000;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}

.toast {
  position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%);
  background: var(--md-sys-color-inverse-surface);
  color: var(--md-sys-color-inverse-on-surface);
  padding: 12px 20px; border-radius: 50px;
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); z-index: 30000;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* ============================== */
/* SKELETON BASE                  */
/* ============================== */
.skel-line,
.skel-circle,
.skel-avatar,
.skel-chip,
.skel-btn,
.skel-toggle,
.skel-bar,
.skel-hero-ring,
.skel-header-icon,
.skel-action-icon,
.skel-badge,
.skel-dot {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Lines */
.skel-line { border-radius: 6px; height: 14px; }
.skel-line--title { width: 100px; height: 16px; }
.skel-line--subtitle { width: 140px; height: 12px; }
.skel-line--short { width: 80px; }
.skel-line--value { width: 70%; height: 22px; }
.skel-line--bar { width: 100%; height: 4px; border-radius: 2px; margin-top: 4px; }
.skel-line--name { width: 60%; height: 14px; }
.skel-line--type { width: 40%; height: 12px; }
.skel-line--balance { width: 75%; height: 24px; border-radius: 8px; }
.skel-line--stat { width: 50px; height: 12px; }
.skel-line--meta { width: 50%; height: 11px; }
.skel-line--amount { width: 90px; height: 16px; border-radius: 8px; }
.skel-line--desc { width: 70%; height: 11px; }
.skel-line--key { width: 50%; height: 11px; }
.skel-line--size { width: 70px; height: 14px; border-radius: 8px; }
.skel-line--xs { width: 48px; height: 12px; }
.skel-line--xxs { width: 36px; height: 9px; }
.skel-line--qs { width: 80px; height: 12px; }
.skel-line--hero-label { width: 160px; height: 14px; border-radius: 20px; }
.skel-line--chip { width: 100px; height: 11px; }

/* Circles */
.skel-circle { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
.skel-circle--icon { width: 40px; height: 40px; border-radius: 12px; }
.skel-circle--sm { width: 34px; height: 34px; border-radius: 9px; }
.skel-circle--xs { width: 14px; height: 14px; border-radius: 50%; }

/* Avatar */
.skel-avatar { width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0; }

/* Chips */
.skel-chip { width: 120px; height: 26px; border-radius: 20px; }
.skel-chip--accent {
  width: 140px;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.08) 25%, rgba(6, 182, 212, 0.18) 50%, rgba(6, 182, 212, 0.08) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
.skel-chip--success {
  width: 110px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.08) 25%, rgba(16, 185, 129, 0.18) 50%, rgba(16, 185, 129, 0.08) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* Badge */
.skel-badge { width: 40px; height: 20px; border-radius: 10px; }

/* Button */
.skel-btn { width: 100px; height: 34px; border-radius: 12px; }

/* Toggle */
.skel-toggle { width: 44px; height: 24px; border-radius: 12px; }

/* Dot */
.skel-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* ============================== */
/* SKELETON HEADER                */
/* ============================== */
.skel-header {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c1222 100%);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 28px;
  padding: 28px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(6, 182, 212, 0.05);
}

.skel-header-decor {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}

.skel-decor-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
}

.skel-decor-1 {
  width: 300px; height: 300px; top: -100px; right: -50px;
  animation: floatSkel 8s ease-in-out infinite;
}

.skel-decor-2 {
  width: 200px; height: 200px; bottom: -80px; left: 20%;
  animation: floatSkel 10s ease-in-out infinite reverse;
}

@keyframes floatSkel {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(10px, -10px) scale(1.05); }
}

.skel-header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.skel-header-left {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  flex: 1;
  min-width: 280px;
}

.skel-header-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.15) 25%, rgba(6, 182, 212, 0.3) 50%, rgba(6, 182, 212, 0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skel-header-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.skel-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skel-meta-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

/* Header Actions */
.skel-header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.skel-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 16px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.15);
}

.skel-action-btn--danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.15);
}

.skel-action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}

.skel-action-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Quick Stats */
.skel-quick-stats {
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

.skel-quick-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
}

.skel-qs-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
}

/* ============================== */
/* SKELETON HERO                  */
/* ============================== */
.skel-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #0c1222 100%);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 28px;
  padding: 32px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.skel-hero-decor {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}

.skel-hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.25;
}

.skel-hero-blob-1 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
  top: -100px; right: -50px;
  animation: blobSkel 12s ease-in-out infinite;
}

.skel-hero-blob-2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, #0891b2 0%, transparent 70%);
  bottom: -60px; left: 10%;
  animation: blobSkel 15s ease-in-out infinite reverse;
}

@keyframes blobSkel {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 20px) scale(1.1); }
}

.skel-hero-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.skel-hero-left {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
}

.skel-hero-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.1);
  border-radius: 20px;
  width: fit-content;
}

.skel-hero-value {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.skel-currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.15);
  line-height: 1;
}

.skel-hero-chips {
  display: flex;
  gap: 10px;
}

.skel-hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.skel-hero-ring {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.05) 25%, rgba(6, 182, 212, 0.12) 50%, rgba(6, 182, 212, 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

/* ============================== */
/* SKELETON STATS GRID            */
/* ============================== */
.skel-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.skel-stat-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
}

.skel-bar { height: 3px; width: 100%; }

.skel-bar--accent {
  background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 25%, rgba(6, 182, 212, 0.5) 50%, rgba(6, 182, 212, 0.2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}

.skel-stat-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skel-stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ============================== */
/* SKELETON SECTIONS (generic)    */
/* ============================== */
.skel-section {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skel-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skel-section-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

/* Wallet skeleton */
.skel-wallet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.skel-wallet-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skel-wallet-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skel-wallet-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.skel-wallet-stats {
  display: flex;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Transactions skeleton */
.skel-trans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skel-trans-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  gap: 12px;
}

.skel-trans-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.skel-trans-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

/* Management skeleton */
.skel-management-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skel-management-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  gap: 12px;
}

.skel-mgmt-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.skel-mgmt-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

/* Storage skeleton */
.skel-storage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skel-storage-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  gap: 12px;
}

.skel-storage-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.skel-storage-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

/* ============================== */
/* RESPONSIVE                     */
/* ============================== */
@media (max-width: 960px) {
  .skel-stats-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .local-data-page { padding: 16px 12px 110px; }

  .skel-header { padding: 20px; border-radius: 22px; }
  .skel-header-content { flex-direction: column; }
  .skel-header-actions { width: 100%; }
  .skel-action-btn { flex: 1; min-width: 0; padding: 10px 12px; }
  .skel-action-text .skel-line--xxs { display: none; }

  .skel-hero { padding: 24px; border-radius: 22px; }
  .skel-hero-content { flex-direction: column; align-items: flex-start; }
  .skel-hero-ring { width: 110px; height: 110px; align-self: center; }

  .skel-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .skel-wallet-grid { grid-template-columns: 1fr; }

  .skel-qs-divider { display: none; }
  .skel-quick-stats { gap: 8px; }
  .skel-quick-stat { padding: 6px 12px; }
}

@media (max-width: 480px) {
  .skel-stats-grid { grid-template-columns: 1fr; }
  .skel-meta-chips { flex-direction: column; }
  .skel-chip { width: 100%; }
  .skel-header-icon { width: 56px; height: 56px; }
}
</style>

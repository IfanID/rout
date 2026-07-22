<script setup>
const {
  t, isMounted,
  walletList, previewWallets, hasMoreWallets,
  showWalletsModal, showWalletDetailModal, selectedWallet,
  isBalanceHidden, getWalletBalance, getWalletStats,
  getWalletTypeInfo, formatRupiah, formatDate,
  handleDeleteWallet, viewWalletDetail
} = useLocalData()
</script>

<template>
  <div class="section-card">
    <!-- Header -->
    <div class="section-header">
      <div class="section-title-group">
        <div class="section-icon">
          <Icon name="material-symbols:wallet-rounded" size="20" />
        </div>
        <div>
          <h3 class="section-title">Dompet</h3>
          <span class="section-count">{{ walletList.length }} dompet terdaftar</span>
        </div>
      </div>
      <button
        v-if="walletList.length > 0"
        class="open-full-btn"
        @click="showWalletsModal = true"
      >
        <span>Buka Penuh</span>
        <Icon name="material-symbols:open-in-new-rounded" size="16" />
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="walletList.length === 0" class="empty-state">
      <Icon name="material-symbols:wallet-rounded" size="48" class="empty-icon" />
      <p>Belum ada dompet terdaftar</p>
    </div>

    <!-- Wallet Grid (Preview max 2) -->
    <div v-else class="wallet-grid">
      <div
        v-for="wallet in previewWallets"
        :key="wallet.id"
        class="wallet-card"
        @click="viewWalletDetail(wallet)"
      >
        <div class="wallet-card-top">
          <div class="wallet-avatar" :style="{ background: getWalletTypeInfo(wallet.type)?.color || '#06b6d4' }">
            <Icon :name="getWalletTypeInfo(wallet.type)?.icon || 'material-symbols:wallet-rounded'" size="24" />
          </div>
          <div class="wallet-info">
            <div class="wallet-name-row">
              <span class="wallet-name">{{ wallet.name }}</span>
              <span v-if="wallet.isDefault" class="default-badge">⭐ Default</span>
            </div>
            <span class="wallet-type">{{ wallet.type }}</span>
          </div>
        </div>

        <div class="wallet-balance">
          <span class="balance-label">Saldo</span>
          <span class="balance-value">
            {{ isBalanceHidden ? '••••••' : 'Rp ' + formatRupiah(getWalletBalance(wallet.id)) }}
          </span>
          <span v-if="wallet.autoBalance" class="auto-badge">Otomatis</span>
        </div>

        <div class="wallet-stats">
          <span class="wallet-stat">
            <Icon name="material-symbols:receipt-long-rounded" size="14" />
            {{ getWalletStats(wallet.id).total }}
          </span>
          <span class="wallet-stat income">
            <Icon name="material-symbols:arrow-downward-rounded" size="14" />
            {{ getWalletStats(wallet.id).income }}
          </span>
          <span class="wallet-stat expense">
            <Icon name="material-symbols:arrow-upward-rounded" size="14" />
            {{ getWalletStats(wallet.id).expense }}
          </span>
        </div>
      </div>
    </div>

    <!-- More indicator (non-clickable, hanya info) -->
    <div v-if="hasMoreWallets" class="more-indicator">
      <Icon name="material-symbols:more-horiz-rounded" size="18" />
      <span>+{{ walletList.length - previewWallets.length }} dompet lainnya</span>
    </div>
  </div>

  <!-- Modal: Semua Dompet -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showWalletsModal" class="modal-overlay" @click.self="showWalletsModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Semua Dompet</h3>
              <span class="modal-subtitle">{{ walletList.length }} dompet terdaftar</span>
            </div>
            <button class="modal-close" @click="showWalletsModal = false">
              <Icon name="material-symbols:close-rounded" size="22" />
            </button>
          </div>

          <div class="modal-body">
            <div
              v-for="wallet in walletList"
              :key="wallet.id"
              class="modal-wallet-item"
            >
              <div class="modal-wallet-left" @click="viewWalletDetail(wallet)">
                <div class="wallet-avatar small" :style="{ background: getWalletTypeInfo(wallet.type)?.color || '#06b6d4' }">
                  <Icon :name="getWalletTypeInfo(wallet.type)?.icon || 'material-symbols:wallet-rounded'" size="18" />
                </div>
                <div class="modal-wallet-info">
                  <div class="wallet-name-row">
                    <span class="wallet-name">{{ wallet.name }}</span>
                    <span v-if="wallet.isDefault" class="default-badge small">⭐</span>
                  </div>
                  <span class="wallet-type">{{ wallet.type }} · {{ getWalletStats(wallet.id).total }} transaksi</span>
                </div>
              </div>
              <div class="modal-wallet-right">
                <span class="modal-balance">
                  {{ isBalanceHidden ? '••••' : 'Rp ' + formatRupiah(getWalletBalance(wallet.id)) }}
                </span>
                <button
                  v-if="!wallet.isDefault"
                  class="delete-btn"
                  @click.stop="handleDeleteWallet(wallet)"
                  title="Hapus dompet"
                >
                  <Icon name="material-symbols:delete-outline-rounded" size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal: Detail Dompet -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showWalletDetailModal && selectedWallet" class="modal-overlay" @click.self="showWalletDetailModal = false">
        <div class="modal-card detail">
          <div class="modal-header">
            <div class="detail-header-left">
              <div class="wallet-avatar" :style="{ background: getWalletTypeInfo(selectedWallet.type)?.color || '#06b6d4' }">
                <Icon :name="getWalletTypeInfo(selectedWallet.type)?.icon || 'material-symbols:wallet-rounded'" size="24" />
              </div>
              <div>
                <h3 class="modal-title">{{ selectedWallet.name }}</h3>
                <span class="modal-subtitle">{{ selectedWallet.type }}</span>
              </div>
            </div>
            <button class="modal-close" @click="showWalletDetailModal = false">
              <Icon name="material-symbols:close-rounded" size="22" />
            </button>
          </div>

          <div class="modal-body">
            <!-- Detail Stats -->
            <div class="detail-stats">
              <div class="detail-stat-card">
                <span class="detail-stat-label">Saldo</span>
                <span class="detail-stat-value">
                  {{ isBalanceHidden ? '••••••' : 'Rp ' + formatRupiah(getWalletBalance(selectedWallet.id)) }}
                </span>
              </div>
              <div class="detail-stat-card">
                <span class="detail-stat-label">Total Transaksi</span>
                <span class="detail-stat-value">{{ getWalletStats(selectedWallet.id).total }}</span>
              </div>
              <div class="detail-stat-card income">
                <span class="detail-stat-label">Pemasukan</span>
                <span class="detail-stat-value">{{ getWalletStats(selectedWallet.id).income }}</span>
              </div>
              <div class="detail-stat-card expense">
                <span class="detail-stat-label">Pengeluaran</span>
                <span class="detail-stat-value">{{ getWalletStats(selectedWallet.id).expense }}</span>
              </div>
            </div>

            <!-- Detail Info -->
            <div class="detail-info">
              <div class="detail-info-row">
                <span class="detail-info-label">ID Wallet</span>
                <span class="detail-info-value mono">{{ selectedWallet.id }}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Default</span>
                <span class="detail-info-value">{{ selectedWallet.isDefault ? 'Ya' : 'Tidak' }}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Tipe</span>
                <span class="detail-info-value">{{ selectedWallet.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.section-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 22px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s;
}

.section-card:hover {
  border-color: rgba(6, 182, 212, 0.15);
}

/* Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(6, 182, 212, 0.12);
  color: #22d3ee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #f1f5f9;
}

.section-count {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.open-full-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(6, 182, 212, 0.2);
  background: rgba(6, 182, 212, 0.08);
  color: #22d3ee;
  font-family: inherit;
}

.open-full-btn:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.35);
  transform: translateY(-1px);
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 0;
  color: #475569;
  font-size: 0.9rem;
}

.empty-icon {
  opacity: 0.3;
}

/* Wallet Grid */
.wallet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.wallet-card {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.wallet-card:hover {
  border-color: rgba(6, 182, 212, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.wallet-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.wallet-avatar.small {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.wallet-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.wallet-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.default-badge {
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #fbbf24;
  white-space: nowrap;
}

.default-badge.small {
  padding: 1px 6px;
  font-size: 0.65rem;
}

.wallet-type {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

/* Balance */
.wallet-balance {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.balance-label {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
}

.balance-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.auto-badge {
  font-size: 0.68rem;
  color: #06b6d4;
  font-weight: 600;
}

/* Stats Row */
.wallet-stats {
  display: flex;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.wallet-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #94a3b8;
}

.wallet-stat.income { color: #34d399; }
.wallet-stat.expense { color: #f87171; }

/* More Indicator */
.more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 500;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
}

/* ========== MODAL ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
}

.modal-card.detail {
  max-width: 480px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modal-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}

.modal-body {
  padding: 16px 24px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Modal Wallet Item */
.modal-wallet-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.modal-wallet-item:hover {
  background: rgba(6, 182, 212, 0.05);
  border-color: rgba(6, 182, 212, 0.12);
}

.modal-wallet-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 0;
  flex: 1;
}

.modal-wallet-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.modal-wallet-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.modal-balance {
  font-size: 0.95rem;
  font-weight: 800;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

/* Detail Stats */
.detail-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.detail-stat-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-stat-card.income {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.12);
}

.detail-stat-card.expense {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.12);
}

.detail-stat-label {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 500;
}

.detail-stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.detail-stat-card.income .detail-stat-value { color: #34d399; }
.detail-stat-card.expense .detail-stat-value { color: #f87171; }

/* Detail Info */
.detail-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.detail-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.detail-info-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.detail-info-value {
  font-size: 0.85rem;
  color: #e2e8f0;
  font-weight: 600;
}

.detail-info-value.mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Modal Transition */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive */
@media (max-width: 640px) {
  .section-card { padding: 18px; }
  .wallet-grid { grid-template-columns: 1fr; }
  .modal-card { max-height: 85vh; border-radius: 20px; }
  .modal-body { padding: 14px 18px 20px; }
  .detail-stats { grid-template-columns: 1fr 1fr; gap: 8px; }
}
</style>

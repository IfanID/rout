<script setup>
const {
  t, getCategoryById,
  sortedTransactionList, filteredTransactions,
  showTransactionsModal, transactionFilter, transactionSearch,
  FILTER_OPTIONS,
  getWalletName, formatRupiah, formatDate, formatDateTime,
  handleDeleteTransaction
} = useLocalData()
</script>

<template>
  <!-- SECTION: TRANSACTIONS -->
  <div class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <Icon name="material-symbols:receipt-long-rounded" size="20" />
        <h2 class="section-title">Riwayat Transaksi</h2>
        <span class="section-count">{{ sortedTransactionList.length }}</span>
      </div>
      <button v-if="sortedTransactionList.length > 0" class="action-btn outline" @click="showTransactionsModal = true">
        <Icon name="material-symbols:open-in-new-rounded" size="16" />
        <span>Buka Penuh</span>
      </button>
    </div>

    <template v-if="sortedTransactionList.length > 0">
      <div class="filter-bar">
        <div class="search-box">
          <Icon name="material-symbols:search-rounded" size="18" />
          <input v-model="transactionSearch" type="text" placeholder="Cari transaksi..." class="search-input" />
          <button v-if="transactionSearch" class="search-clear" @click="transactionSearch = ''">
            <Icon name="material-symbols:close-rounded" size="16" />
          </button>
        </div>
        <div class="filter-chips">
          <button
            v-for="opt in FILTER_OPTIONS" :key="opt.value"
            class="filter-chip" :class="{ active: transactionFilter === opt.value }"
            @click="transactionFilter = opt.value"
          >
            <Icon :name="opt.icon" size="14" />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <div class="transaction-list">
        <div v-for="trans in filteredTransactions.slice(0, 5)" :key="trans.id" class="trans-item">
          <div class="trans-left">
            <div
              class="trans-icon"
              :style="{
                backgroundColor: (getCategoryById(trans.categoryId)?.color || '#888') + '20',
                color: getCategoryById(trans.categoryId)?.color || '#888'
              }"
            >
              <Icon :name="getCategoryById(trans.categoryId)?.icon || 'mdi:help-circle'" size="18" />
            </div>
            <div class="trans-info">
              <div class="trans-title">
                {{ getCategoryById(trans.categoryId) ? t(getCategoryById(trans.categoryId).labelKey) : trans.type }}
              </div>
              <div class="trans-meta">
                <span class="trans-wallet">{{ getWalletName(trans.walletId) }}</span>
                <span class="meta-sep">·</span>
                <span class="trans-date">{{ formatDate(trans.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="trans-right">
            <span class="trans-amount" :class="trans.type">
              {{ trans.type === 'income' ? '+' : trans.type === 'expense' ? '-' : '↔' }}
              Rp {{ formatRupiah(trans.amount) }}
            </span>
            <button class="icon-btn danger-sm" @click="handleDeleteTransaction(trans)" title="Hapus">
              <Icon name="material-symbols:close-rounded" size="16" />
            </button>
          </div>
        </div>

        <div v-if="filteredTransactions.length === 0" class="empty-filter">
          <Icon name="material-symbols:search-off-rounded" size="32" />
          <p>Tidak ada transaksi yang cocok</p>
        </div>

        <button v-if="filteredTransactions.length > 5" class="view-more-btn" @click="showTransactionsModal = true">
          Lihat semua {{ filteredTransactions.length }} transaksi
          <Icon name="material-symbols:arrow-forward-rounded" size="16" />
        </button>
      </div>
    </template>

    <div v-else class="empty-state">
      <Icon name="material-symbols:receipt-long-outline" size="48" />
      <p>Belum ada transaksi</p>
    </div>
  </div>

  <!-- MODAL: FULL TRANSACTIONS -->
  <Teleport to="body">
    <div v-if="showTransactionsModal" class="modal-overlay" @click.self="showTransactionsModal = false">
      <div class="modal-box large">
        <div class="modal-header">
          <div>
            <h3>Semua Transaksi</h3>
            <p class="modal-subtitle">{{ filteredTransactions.length }} dari {{ sortedTransactionList.length }} transaksi</p>
          </div>
          <button class="close-btn" @click="showTransactionsModal = false">
            <Icon name="material-symbols:close-rounded" size="24" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="filteredTransactions.length > 0" class="transaction-cards">
            <div v-for="trans in filteredTransactions" :key="trans.id" class="trans-card-full">
              <div class="trans-card-left">
                <div
                  class="trans-icon-lg"
                  :style="{
                    backgroundColor: (getCategoryById(trans.categoryId)?.color || '#888') + '20',
                    color: getCategoryById(trans.categoryId)?.color || '#888'
                  }"
                >
                  <Icon :name="getCategoryById(trans.categoryId)?.icon || 'mdi:help-circle'" size="22" />
                </div>
                <div class="trans-info-full">
                  <div class="trans-title-full">
                    {{ getCategoryById(trans.categoryId) ? t(getCategoryById(trans.categoryId).labelKey) : trans.type }}
                  </div>
                  <div class="trans-meta-full">
                    <span class="meta-chip">
                      <Icon name="material-symbols:wallet-outline" size="12" />
                      {{ getWalletName(trans.walletId) }}
                    </span>
                    <span v-if="trans.description" class="meta-chip">
                      <Icon name="material-symbols:notes-rounded" size="12" />
                      {{ trans.description }}
                    </span>
                  </div>
                  <div class="trans-date-full">
                    <Icon name="material-symbols:schedule-rounded" size="12" />
                    {{ formatDateTime(trans.createdAt) }}
                  </div>
                </div>
              </div>
              <div class="trans-card-right">
                <span class="trans-amount-lg" :class="trans.type">
                  {{ trans.type === 'income' ? '+' : trans.type === 'expense' ? '-' : '↔' }}
                  Rp {{ formatRupiah(trans.amount) }}
                </span>
                <button class="icon-btn danger" @click="handleDeleteTransaction(trans)" title="Hapus">
                  <Icon name="material-symbols:delete-outline" size="20" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <Icon name="material-symbols:search-off-rounded" size="48" />
            <p>Tidak ada transaksi</p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.section { display: flex; flex-direction: column; gap: 14px; }
.section-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.section-title-wrap { display: flex; align-items: center; gap: 8px; color: var(--md-sys-color-primary); }
.section-title { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--md-sys-color-on-surface); }
.section-count {
  background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);
  padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;
}

.action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface-variant); white-space: nowrap;
}
.action-btn:hover { background: var(--md-sys-color-surface-variant); border-color: var(--md-sys-color-primary); }
.action-btn.outline { padding: 8px 12px; font-size: 0.8rem; }

.filter-bar {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 14px; padding: 12px;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--md-sys-color-surface-variant);
  padding: 8px 14px; border-radius: 10px;
  color: var(--md-sys-color-on-surface-variant);
}
.search-input { flex: 1; border: none; background: transparent; font-size: 0.9rem; color: var(--md-sys-color-on-surface); outline: none; font-family: inherit; }
.search-clear { background: none; border: none; cursor: pointer; color: var(--md-sys-color-on-surface-variant); padding: 2px; border-radius: 50%; display: flex; align-items: center; }
.search-clear:hover { background: var(--md-sys-color-outline-variant); }

.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 20px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid transparent;
  font-size: 0.8rem; font-weight: 500;
  cursor: pointer; transition: all 0.2s;
}
.filter-chip:hover { border-color: var(--md-sys-color-primary); }
.filter-chip.active { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }

.transaction-list {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
}
.trans-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; gap: 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  transition: background 0.15s;
}
.trans-item:last-child { border-bottom: none; }
.trans-item:hover { background: var(--md-sys-color-surface-variant); }
.trans-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.trans-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.trans-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.trans-title { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trans-meta { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.meta-sep { opacity: 0.5; }
.trans-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.trans-amount { font-weight: 700; font-size: 0.95rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.trans-amount.income { color: #059669; }
.trans-amount.expense { color: #dc2626; }
.trans-amount.transfer, .trans-amount.debt { color: #2563eb; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  border: none; background: transparent;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn:hover:not(:disabled) { background: var(--md-sys-color-surface-variant); }
.icon-btn.danger:hover:not(:disabled) { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.icon-btn.danger-sm { width: 28px; height: 28px; }

.view-more-btn {
  padding: 12px; border: none;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-primary);
  font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 4px;
  border-radius: 12px;
}
.view-more-btn:hover { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); }

.empty-state, .empty-filter {
  text-align: center; padding: 32px 16px;
  color: var(--md-sys-color-on-surface-variant);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--md-sys-color-surface-container);
  border: 1px dashed var(--md-sys-color-outline-variant);
  border-radius: 16px;
}
.empty-state p, .empty-filter p { margin: 0; font-size: 0.9rem; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: fadeIn 0.2s ease;
}
.modal-box {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px; width: 100%; max-width: 480px;
  max-height: 85vh; display: flex; flex-direction: column;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  animation: scaleIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-box.large { max-width: 640px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px; gap: 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
.modal-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; }
.modal-subtitle { margin: 4px 0 0; font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); }
.close-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: none; background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.close-btn:hover { background: var(--md-sys-color-outline-variant); }
.modal-body { padding: 20px 24px; overflow-y: auto; flex: 1; }

.transaction-cards { display: flex; flex-direction: column; gap: 10px; }
.trans-card-full {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 14px; background: var(--md-sys-color-surface-variant);
  border-radius: 14px; transition: all 0.15s;
}
.trans-card-full:hover { background: var(--md-sys-color-surface); }
.trans-card-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.trans-icon-lg { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.trans-info-full { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.trans-title-full { font-weight: 600; font-size: 0.95rem; }
.trans-meta-full { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: 6px;
  background: var(--md-sys-color-surface-container);
  font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant);
}
.trans-date-full { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant); opacity: 0.8; }
.trans-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
.trans-amount-lg { font-weight: 700; font-size: 1rem; font-variant-numeric: tabular-nums; white-space: nowrap; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

@media (max-width: 640px) {
  .trans-card-full { flex-direction: column; align-items: stretch; }
  .trans-card-right { flex-direction: row; justify-content: space-between; }
}
</style>

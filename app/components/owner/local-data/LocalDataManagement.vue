<script setup>
const {
  isBalanceHidden,
  navCenterMenu, navFinanceCenter, navOwnerCenter,
  DATA_KEYS, STORAGE_KEY_META,
  storageDetails, storageDetailData,
  showStorageDetailModal, selectedStorageKey,
  TYPE_LABELS, TYPE_COLORS,
  stats, formatRupiah,
  resetNavCenter, openStorageDetail,
  handleDeleteStorageKey, copyStorageData
} = useLocalData()
</script>

<template>
  <!-- SECTION: SETTINGS -->
  <div class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <Icon name="material-symbols:settings-rounded" size="20" />
        <h2 class="section-title">Pengaturan</h2>
      </div>
      <span class="section-hint">Konfigurasi tampilan & navigasi</span>
    </div>

    <div class="settings-card">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-icon">
            <Icon name="material-symbols:visibility-off-rounded" size="18" />
          </div>
          <div class="setting-text">
            <span class="setting-label">Sembunyikan Saldo</span>
            <span class="setting-desc">Sensor semua angka balance di UI</span>
          </div>
        </div>
        <div class="toggle-switch" :class="{ active: isBalanceHidden }" @click="isBalanceHidden = !isBalanceHidden">
          <div class="toggle-knob"></div>
        </div>
      </div>

      <div
        class="setting-row"
        v-for="(item, key) in {
          'User Navbar': { key: 'navCenterMenu', val: navCenterMenu, def: 'running-man', icon: 'material-symbols:person-rounded' },
          'Finance Navbar': { key: 'navFinanceCenter', val: navFinanceCenter, def: 'analytics', icon: 'material-symbols:account-balance-wallet-rounded' },
          'Owner Navbar': { key: 'navOwnerCenter', val: navOwnerCenter, def: 'dashboard', icon: 'material-symbols:admin-panel-settings-rounded' }
        }"
        :key="item.key"
      >
        <div class="setting-info">
          <div class="setting-icon">
            <Icon :name="item.icon" size="18" />
          </div>
          <div class="setting-text">
            <span class="setting-label">{{ key }}</span>
            <span class="setting-desc">Menu tengah aktif: <code>{{ item.val }}</code></span>
          </div>
        </div>
        <button class="reset-btn" @click="resetNavCenter(item.key, item.def)">
          <Icon name="material-symbols:refresh-rounded" size="16" />
          Reset
        </button>
      </div>
    </div>
  </div>

  <!-- SECTION: STORAGE INFO -->
  <div class="section">
    <div class="section-header">
      <div class="section-title-wrap">
        <Icon name="material-symbols:storage-rounded" size="20" />
        <h2 class="section-title">Informasi Penyimpanan</h2>
      </div>
      <span class="section-hint">Data keuangan tersimpan</span>
    </div>

    <div class="storage-card">
      <button
        v-for="item in storageDetails" :key="item.key"
        class="storage-item-btn" @click="openStorageDetail(item.key)"
      >
        <div class="storage-item-left">
          <div class="storage-item-icon" :class="{ active: item.active }">
            <Icon :name="STORAGE_KEY_META[item.key]?.icon || 'material-symbols:data-object-rounded'" size="18" />
          </div>
          <div class="storage-item-text">
            <span class="storage-item-label">{{ STORAGE_KEY_META[item.key]?.label || item.key }}</span>
            <span class="storage-item-key">{{ item.key }}</span>
          </div>
        </div>
        <div class="storage-item-right">
          <span class="storage-size">{{ item.size }}</span>
          <span class="storage-status" :class="{ active: item.active }">
            {{ item.active ? 'Aktif' : 'Kosong' }}
          </span>
          <Icon name="material-symbols:chevron-right-rounded" size="20" class="chevron" />
        </div>
      </button>
      <div class="storage-total">
        <span>Total {{ DATA_KEYS.length }} item data keuangan</span>
        <strong>{{ stats.storageUsed }}</strong>
      </div>
    </div>
  </div>

  <!-- MODAL: STORAGE DETAIL -->
  <Teleport to="body">
    <div v-if="showStorageDetailModal && storageDetailData" class="modal-overlay" @click.self="showStorageDetailModal = false">
      <div class="modal-box storage-detail-modal">
        <div class="modal-header">
          <div class="storage-detail-header">
            <div class="storage-detail-icon" :class="{ active: storageDetailData.active }">
              <Icon :name="storageDetailData.meta.icon" size="26" />
            </div>
            <div>
              <h3>{{ storageDetailData.meta.label }}</h3>
              <p class="modal-subtitle">{{ storageDetailData.meta.category }}</p>
            </div>
          </div>
          <button class="close-btn" @click="showStorageDetailModal = false">
            <Icon name="material-symbols:close-rounded" size="24" />
          </button>
        </div>

        <div class="modal-body">
          <div class="sd-description">
            <Icon name="material-symbols:info-outline" size="16" />
            <span>{{ storageDetailData.meta.description }}</span>
          </div>

          <div class="sd-info-grid">
            <div class="sd-info-item">
              <span class="sd-info-label">Status</span>
              <span class="sd-info-value">
                <span class="sd-status-dot" :class="{ active: storageDetailData.active }"></span>
                {{ storageDetailData.active ? 'Tersimpan' : 'Kosong' }}
              </span>
            </div>
            <div class="sd-info-item">
              <span class="sd-info-label">Ukuran</span>
              <span class="sd-info-value">{{ storageDetailData.size }}</span>
            </div>
            <div class="sd-info-item">
              <span class="sd-info-label">Tipe Data</span>
              <span class="sd-info-value">
                <span class="sd-type-badge" :style="{ background: (TYPE_COLORS[storageDetailData.type] || '#6b7280') + '20', color: TYPE_COLORS[storageDetailData.type] || '#6b7280' }">
                  {{ TYPE_LABELS[storageDetailData.type] || storageDetailData.type }}
                </span>
              </span>
            </div>
            <div class="sd-info-item">
              <span class="sd-info-label">Jumlah Item</span>
              <span class="sd-info-value">{{ storageDetailData.itemCount }}</span>
            </div>
          </div>

          <div class="sd-key-row">
            <span class="sd-key-label">Key</span>
            <code class="sd-key-value">{{ storageDetailData.key }}</code>
          </div>

          <div v-if="storageDetailData.type === 'object' && storageDetailData.keys.length > 0" class="sd-keys-list">
            <span class="sd-keys-title">Properties ({{ storageDetailData.keys.length }})</span>
            <div class="sd-keys-chips">
              <span v-for="k in storageDetailData.keys" :key="k" class="sd-key-chip">{{ k }}</span>
            </div>
          </div>

          <div v-if="storageDetailData.active" class="sd-preview-section">
            <div class="sd-preview-header">
              <span class="sd-preview-title">
                <Icon name="material-symbols:code-rounded" size="16" />
                Preview Data
              </span>
              <button class="sd-copy-btn" @click="copyStorageData" title="Salin ke clipboard">
                <Icon name="material-symbols:content-copy-rounded" size="16" />
                <span>Salin</span>
              </button>
            </div>
            <div class="sd-preview-code">
              <pre>{{ storageDetailData.preview }}</pre>
            </div>
          </div>

          <div v-else class="sd-empty">
            <Icon name="material-symbols:inbox-rounded" size="40" />
            <p>Data belum tersimpan</p>
            <span>Key ini belum memiliki data di localStorage.</span>
          </div>

          <div class="sd-actions">
            <button v-if="storageDetailData.active" class="sd-btn sd-btn-danger" @click="handleDeleteStorageKey(storageDetailData.key)">
              <Icon name="material-symbols:delete-outline" size="18" />
              Hapus Data Ini
            </button>
            <button class="sd-btn sd-btn-secondary" @click="showStorageDetailModal = false">
              Tutup
            </button>
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
.section-hint { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); opacity: 0.7; }

/* Settings */
.settings-card {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px; overflow: hidden;
}
.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; gap: 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}
.setting-row:last-child { border-bottom: none; }
.setting-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.setting-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-primary);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.setting-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.setting-label { font-weight: 600; font-size: 0.9rem; color: var(--md-sys-color-on-surface); }
.setting-desc { font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); }
.setting-desc code { background: var(--md-sys-color-surface-variant); padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-family: monospace; }

.toggle-switch {
  width: 48px; height: 28px;
  background: var(--md-sys-color-surface-variant);
  border: 2px solid var(--md-sys-color-outline);
  border-radius: 14px; position: relative; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.toggle-switch.active { background: var(--md-sys-color-primary); border-color: var(--md-sys-color-primary); }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: var(--md-sys-color-outline); border-radius: 50%; transition: all 0.2s; }
.toggle-switch.active .toggle-knob { left: 22px; background: var(--md-sys-color-on-primary); }

.reset-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 8px;
  background: var(--md-sys-color-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-primary);
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.reset-btn:hover { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border-color: var(--md-sys-color-primary); }

/* Storage */
.storage-card {
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 16px; overflow: hidden;
}
.storage-item-btn {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 14px 16px; gap: 12px;
  border: none; border-bottom: 1px solid var(--md-sys-color-outline-variant);
  background: transparent; cursor: pointer; transition: all 0.15s;
  text-align: left; font-family: inherit; color: inherit;
}
.storage-item-btn:last-of-type { border-bottom: none; }
.storage-item-btn:hover { background: var(--md-sys-color-surface-variant); }
.storage-item-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.storage-item-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s;
}
.storage-item-icon.active { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }
.storage-item-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.storage-item-label { font-weight: 600; font-size: 0.9rem; color: var(--md-sys-color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.storage-item-key { font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant); font-family: monospace; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.storage-item-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.storage-size { font-size: 0.8rem; font-weight: 600; color: var(--md-sys-color-on-surface-variant); font-variant-numeric: tabular-nums; }
.storage-status { padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); }
.storage-status.active { background: #d1fae5; color: #059669; }
.chevron { color: var(--md-sys-color-on-surface-variant); opacity: 0.4; transition: all 0.2s; }
.storage-item-btn:hover .chevron { opacity: 0.8; transform: translateX(2px); }
.storage-total { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--md-sys-color-surface-variant); font-size: 0.9rem; }
.storage-total strong { color: var(--md-sys-color-primary); font-size: 1rem; }

/* Storage Detail Modal */
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
.storage-detail-modal { max-width: 560px; }
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

.storage-detail-header { display: flex; align-items: center; gap: 14px; }
.storage-detail-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.storage-detail-icon.active { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); }

.sd-description {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 12px 14px; background: var(--md-sys-color-surface-variant);
  border-radius: 12px; font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant); line-height: 1.5; margin-bottom: 16px;
}
.sd-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.sd-info-item { padding: 12px; background: var(--md-sys-color-surface-variant); border-radius: 10px; display: flex; flex-direction: column; gap: 4px; }
.sd-info-label { font-size: 0.7rem; color: var(--md-sys-color-on-surface-variant); text-transform: uppercase; letter-spacing: 0.5px; }
.sd-info-value { font-size: 0.9rem; font-weight: 600; color: var(--md-sys-color-on-surface); display: flex; align-items: center; gap: 6px; }
.sd-status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--md-sys-color-on-surface-variant); flex-shrink: 0; }
.sd-status-dot.active { background: #059669; }
.sd-type-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }

.sd-key-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--md-sys-color-surface-variant); border-radius: 10px; margin-bottom: 12px; }
.sd-key-label { font-size: 0.75rem; font-weight: 600; color: var(--md-sys-color-on-surface-variant); flex-shrink: 0; }
.sd-key-value { font-family: monospace; font-size: 0.8rem; background: var(--md-sys-color-surface-container); padding: 3px 8px; border-radius: 6px; color: var(--md-sys-color-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }

.sd-keys-list { margin-bottom: 12px; }
.sd-keys-title { display: block; font-size: 0.75rem; font-weight: 600; color: var(--md-sys-color-on-surface-variant); margin-bottom: 8px; }
.sd-keys-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.sd-key-chip { padding: 4px 10px; border-radius: 8px; background: var(--md-sys-color-surface-variant); font-family: monospace; font-size: 0.75rem; color: var(--md-sys-color-on-surface); border: 1px solid var(--md-sys-color-outline-variant); }

.sd-preview-section { margin-bottom: 16px; }
.sd-preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.sd-preview-title { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--md-sys-color-on-surface-variant); }
.sd-copy-btn { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: var(--md-sys-color-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); color: var(--md-sys-color-primary); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.sd-copy-btn:hover { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); border-color: var(--md-sys-color-primary); }

.sd-preview-code { background: #1e1e2e; border-radius: 12px; padding: 14px 16px; overflow-x: auto; max-height: 280px; overflow-y: auto; }
.sd-preview-code pre { margin: 0; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.6; color: #cdd6f4; white-space: pre-wrap; word-break: break-all; }

.sd-empty { text-align: center; padding: 28px 16px; color: var(--md-sys-color-on-surface-variant); display: flex; flex-direction: column; align-items: center; gap: 6px; background: var(--md-sys-color-surface-variant); border-radius: 12px; margin-bottom: 16px; }
.sd-empty p { margin: 0; font-size: 0.95rem; font-weight: 600; }
.sd-empty span { font-size: 0.8rem; opacity: 0.7; }

.sd-actions { display: flex; gap: 10px; }
.sd-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border: none; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.sd-btn-danger { background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container); }
.sd-btn-danger:hover { background: var(--md-sys-color-error); color: var(--md-sys-color-on-error); }
.sd-btn-secondary { background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface-variant); }
.sd-btn-secondary:hover { background: var(--md-sys-color-outline-variant); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

@media (max-width: 640px) {
  .sd-info-grid { grid-template-columns: 1fr; }
  .storage-item-right .storage-size { display: none; }
  .sd-actions { flex-direction: column; }
}
</style>

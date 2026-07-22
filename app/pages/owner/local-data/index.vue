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
    <!-- ========== SKELETON LOADING (Universal) ========== -->
    <SkeletonAppSkeletonLoader
      :show="!isMounted"
      size="md"
      fullscreen
    />

    <!-- ========== KONTEN ASLI ========== -->
    <template v-if="isMounted">
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
/* RESPONSIVE                     */
/* ============================== */
@media (max-width: 768px) {
  .local-data-page { padding: 16px 12px 110px; }
}
</style>

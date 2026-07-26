<script setup lang="ts">
import { useLocalData } from '~/composables/owner/useLocalData'

const {
  isMounted, initMounted,
  showDeleteAllDialog, dialogConfig, deleteAll,
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
        <SharedConfirmDialog
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
        <SharedConfirmDialog
          title="Hapus Semua Data?"
          message="Tindakan ini akan menghapus SEMUA data wallet, transaksi, dan pengaturan dari browser. Tindakan tidak dapat dibatalkan."
          confirmText="Ya, Hapus Semua"
          cancelText="Batal"
          @confirm="deleteAll"
          @cancel="showDeleteAllDialog = false"
        />
      </div>
    </Teleport>

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
/* DIALOG                         */
/* ============================== */
.dialog-overlay {
  position: fixed; inset: 0; z-index: 20000;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}

/* ============================== */
/* RESPONSIVE                     */
/* ============================== */
@media (max-width: 768px) {
  .local-data-page { padding: 16px 12px 110px; }
}
</style>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  positioned: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-box" :class="{ 'is-positioned': positioned }">
      <h2 class="dialog-title">{{ title }}</h2>
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-actions">
        <button class="dialog-btn cancel-btn" @click="emit('cancel')">
          {{ cancelText }}
        </button>
        <button class="dialog-btn confirm-btn" @click="emit('confirm')">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.dialog-box {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  max-width: 300px;
  box-shadow: var(--shadow-lg);
  animation: slideDown 0.2s ease;
}

/* Mode absolute untuk dialog yang muncul dekat tombol (misal: hapus dompet) */
.dialog-box.is-positioned {
  position: absolute;
  top: var(--dialog-top, 50%);
  right: var(--dialog-right, 20px);
  width: 280px;
  max-width: calc(100vw - 40px);
}

.dialog-title {
  margin: 0 0 8px;
  font-size: 1.1rem;
  text-align: center;
  color: var(--md-sys-color-on-surface);
}

.dialog-message {
  margin: 0 0 20px;
  font-size: 0.9rem;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.4;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dialog-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 14px;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.cancel-btn:hover {
  background-color: var(--md-sys-color-outline-variant);
}

.confirm-btn {
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.confirm-btn:hover {
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
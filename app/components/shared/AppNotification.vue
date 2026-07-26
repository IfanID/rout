<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '~/composables/shared/useNotification'
const { toast } = useNotification()

const iconName = computed(() => {
  switch (toast.value.type) {
    case 'success': return 'material-symbols:check-circle-rounded'
    case 'error': return 'material-symbols:error-rounded'
    case 'warning': return 'material-symbols:warning-rounded'
    default: return 'material-symbols:info-rounded'
  }
})
</script>

<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="toast">
        <div v-if="toast.show" :key="toast.message" class="toast-item" :class="toast.type">
          <Icon :name="iconName" size="20" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  left: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  background: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  font-size: 0.9rem;
  pointer-events: auto;
  max-width: 340px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.success {
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.error {
  border-left: 4px solid #f44336;
  color: #c62828;
}

.warning {
  border-left: 4px solid #ff9800;
  color: #e65100;
}

.info {
  border-left: 4px solid #2196f3;
  color: #1565c0;
}

/* Animasi */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
</style>
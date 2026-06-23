<script setup>
defineProps({
  title: {
    type: String,
    default: '[Diisi untuk Judul Dialog]'
  },
  message: {
    type: String,
    default: '[Diisi untuk Pesan/Detail Peringatan]'
  },
  confirmText: {
    type: String,
    default: '[Diisi untuk Teks Tombol Eksekusi]'
  },
  cancelText: {
    type: String,
    default: '[Diisi untuk Teks Tombol Pembatalan]'
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <!-- Hanya struktur dasar, tanpa styling apapun -->
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div class="dialog-box">
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

<!-- TIDAK ADA TAG <style> DISINI -->
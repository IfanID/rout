<script setup>
import { ref, watch } from 'vue'

const { t } = useI18n()

const props = defineProps({
  wallet: {
    type: Object,
    required: true
  },
  isBalanceHidden: {
    type: Boolean,
    default: false
  },
  // Trigger dari parent untuk menutup menu (hanya saat konfirmasi sukses)
  closeTrigger: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-hide', 'rename', 'set-default', 'delete'])

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// WATCH: Tutup menu jika parent mengirim sinyal (saat data berhasil dihapus)
watch(() => props.closeTrigger, () => {
  if (isMenuOpen.value) {
    closeMenu()
  }
})

// Format Rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const getDisplayBalance = (value) => {
  if (props.isBalanceHidden) {
    return formatRupiah(value).replace(/[0-9]/g, 'x')
  }
  return formatRupiah(value)
}
</script>

<template>
  <div class="wallet-card">
    
    <!-- Menu Titik Tiga -->
    <div class="card-menu-wrapper">
      <button class="menu-btn" @click="toggleMenu">
        <Icon name="mdi:dots-vertical" size="20" />
      </button>
      
      <div v-if="isMenuOpen" class="dropdown-menu">
        <div class="dropdown-item" @click="emit('rename', wallet); closeMenu()">
          <Icon name="mdi:pencil" size="18" />
          <span>{{ t('pages.finance.wallets.menu.rename') }}</span>
        </div>
        <div v-if="!wallet.isDefault" class="dropdown-item" @click="emit('set-default', wallet.id); closeMenu()">
          <Icon name="mdi:star" size="18" />
          <span>{{ t('pages.finance.wallets.menu.set_default') }}</span>
        </div>
        <!-- TANPA closeMenu() -- menu tetap terbuka saat ini dipilih -->
        <div v-if="!wallet.isDefault" class="dropdown-item text-danger" @click="emit('delete', wallet, $event)">
          <Icon name="mdi:trash-can-outline" size="18" />
          <span>{{ t('pages.finance.wallets.menu.delete') }}</span>
        </div>
      </div>
    </div>

    <!-- Detail Kartu -->
    <div class="wallet-top">
      <div class="wallet-icon-bg">
        <Icon :name="wallet.icon" size="28" class="wallet-icon" />
      </div>
      <div class="wallet-info">
        <span class="wallet-name">
          {{ wallet.name }}
          <Icon v-if="wallet.isDefault" name="mdi:star" size="16" class="default-star" />
        </span>
        <span class="wallet-type">{{ wallet.type }}</span>
      </div>
    </div>

    <div class="wallet-balance-section">
      <div class="balance-header">
        <span class="balance-label">{{ t('pages.finance.wallets.balance') }}</span>
        <button class="eye-btn" @click="emit('toggle-hide')">
          <Icon :name="isBalanceHidden ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" size="20" />
        </button>
      </div>
      <h2 class="balance-amount">{{ getDisplayBalance(wallet.balance) }}</h2>
    </div>

    <!-- Overlay -->
    <div v-if="isMenuOpen" class="menu-overlay" @click="closeMenu"></div>
  </div>
</template>

<style scoped>
/* === KARTU DOMPET === */
.wallet-card {
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 20px;
  position: relative;
  transition: transform 0.2s ease;
}

.wallet-card:hover {
  transform: translateY(-2px);
}

/* === MENU DROPDOWN TITIK TIGA === */
.card-menu-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1002;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.dropdown-menu {
  position: absolute;
  top: 32px;
  right: 0;
  width: 180px;
  background-color: var(--md-sys-color-surface-container);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1002;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.text-danger {
  color: var(--md-sys-color-error);
}

/* === OVERLAY === */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 900;
  background-color: transparent;
}

/* === DETAIL KARTU === */
.wallet-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.wallet-icon-bg {
  width: 48px;
  height: 48px;
  background-color: var(--md-sys-color-primary-container);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon {
  color: var(--md-sys-color-on-primary-container);
}

.wallet-info {
  display: flex;
  flex-direction: column;
}

.wallet-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  display: flex;
  align-items: center;
  gap: 4px;
}

.default-star {
  color: #FFD700;
}

.wallet-type {
  font-size: 0.8rem;
  color: var(--md-sys-color-on-surface-variant);
}

.wallet-balance-section {
  margin-bottom: 8px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.balance-label {
  font-size: 0.85rem;
  color: var(--md-sys-color-on-surface-variant);
  display: block;
}

.eye-btn {
  background: transparent;
  border: none;
  color: var(--md-sys-color-on-surface-variant);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  transition: background-color 0.2s;
}

.eye-btn:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.balance-amount {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--md-sys-color-primary);
  letter-spacing: -0.5px;
}
</style>
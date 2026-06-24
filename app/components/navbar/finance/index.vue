<script setup>
import { ref } from 'vue'

const centerMenu = useState('navFinanceCenter', () => 'analytics')
const showQuickAddMenu = ref(false)

const centerConfig = computed(() => {
  if (centerMenu.value === 'debt') {
    return { to: '/finance/debt', icon: 'mdi:hand-coin-outline', title: 'Debt', isAction: false }
  }
  if (centerMenu.value === 'pencatat') {
    return { to: '#', icon: 'mdi:plus', title: 'Pencatat', isAction: true }
  }
  return { to: '/finance/analytics', icon: 'material-symbols:donut-large-rounded', title: 'Analytics', isAction: false }
})

const handleCenterClick = () => {
  if (centerConfig.value.isAction) {
    showQuickAddMenu.value = !showQuickAddMenu.value
  }
}

const closeQuickAddMenu = () => {
  showQuickAddMenu.value = false
}
</script>

<template>
  <nav class="navbar-wrapper">
    
    <!-- Panggil Komponen Pop-up Pencatat -->
    <QuickAddMenu 
      v-if="showQuickAddMenu && centerConfig.isAction" 
      @close="closeQuickAddMenu" 
    />

    <!-- Navbar Utama -->
    <div class="navbar">
      <NuxtLink to="/finance" class="nav-link" title="Beranda">
        <Icon name="material-symbols:monitoring-rounded" size="24" />
        <span class="nav-label">Beranda</span>
      </NuxtLink>

      <NuxtLink to="/finance/transactions" class="nav-link" title="Transaksi">
        <Icon name="material-symbols:receipt-long-rounded" size="24" />
        <span class="nav-label">Transaksi</span>
      </NuxtLink>

      <!-- Center Floating Button -->
      <div class="center-menu-container">
        <NuxtLink 
          v-if="!centerConfig.isAction" 
          :to="centerConfig.to" 
          class="center-btn" 
          :title="centerConfig.title"
        >
          <Icon :name="centerConfig.icon" size="32" />
        </NuxtLink>

        <button 
          v-else 
          class="center-btn" 
          :title="centerConfig.title" 
          @click="handleCenterClick"
        >
          <Icon :name="centerConfig.icon" size="32" />
        </button>
      </div>

      <NuxtLink to="/finance/wallets" class="nav-link" title="Dompet">
        <Icon name="material-symbols:payments-rounded" size="24" />
        <span class="nav-label">Dompet</span>
      </NuxtLink>

      <NuxtLink to="/finance/profile" class="nav-link" title="Profile">
        <Icon name="material-symbols:person-rounded" size="24" />
        <span class="nav-label">Profile</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar-wrapper {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-around;

  width: 380px;
  height: 75px;

  padding: 8px 16px;

  background-color: var(--md-sys-color-surface-container);

  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;

  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  flex: 1;
  text-align: center;

  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  font-weight: 500;

  transition: var(--transition);

  -webkit-tap-highlight-color: transparent;
}

.nav-link:hover {
  color: var(--md-sys-color-primary);
}

.nav-label {
  font-size: 0.7rem;
}

/* Center floating menu */
.center-menu-container {
  position: relative;
  margin: 0 10px;
}

.center-btn {
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
  padding: 0;
  
  position: relative;
  z-index: 1002;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 64px;
  height: 64px;
  margin-top: -30px;

  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);

  border-radius: 50%;
  border: 6px solid var(--md-sys-color-surface-container);

  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 800;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  transition: var(--transition);

  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}

.center-btn:hover {
  transform: scale(1.1);
  background-color: var(--md-sys-color-primary-hover);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .navbar-wrapper { bottom: 16px; }
  .navbar { width: calc(100vw - 32px); min-width: 0; height: 64px; padding: 6px 12px; border-radius: 16px; }
  .center-btn { width: 52px; height: 52px; margin-top: -24px; font-size: 1rem; }
  .nav-label { font-size: 0.6rem; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .navbar { width: 440px; height: 70px; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .navbar { width: 500px; }
}
</style>
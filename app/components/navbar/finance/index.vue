<script setup lang="ts">
import { ref } from 'vue'

const { t } = useI18n()

const centerMenu = useState('navFinanceCenter', () => 'analytics')
const showQuickAddMenu = ref(false)

const centerConfig = computed(() => {
  if (centerMenu.value === 'debt') {
    return { to: '/finance/debt', icon: 'mdi:hand-coin-outline', title: t('components.navbar.debt'), isAction: false }
  }
  if (centerMenu.value === 'pencatat') {
    return { to: '#', icon: 'mdi:plus', title: t('components.centerMenu.pencatat'), isAction: true }
  }
  return { to: '/finance/analytics', icon: 'material-symbols:donut-large-rounded', title: t('components.navbar.analytics'), isAction: false }
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
    
    <FinanceQuickAddMenu
      v-if="showQuickAddMenu && centerConfig.isAction"
      @close="closeQuickAddMenu"
    />

    <div class="navbar">
      <NuxtLink to="/finance" class="nav-link" :title="t('components.navbar.home')">
        <Icon name="material-symbols:monitoring-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.home') }}</span>
      </NuxtLink>

      <NuxtLink to="/finance/transactions" class="nav-link" :title="t('components.navbar.transactions')">
        <Icon name="material-symbols:receipt-long-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.transactions') }}</span>
      </NuxtLink>

      <!-- Center Floating Button -->
      <div class="center-menu-container">
        <ClientOnly>
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

          <!-- PANGGIL KOMPONEN SKELETON -->
          <template #fallback>
            <SkeletonNavbarCenterButton />
          </template>
        </ClientOnly>
      </div>

      <NuxtLink to="/finance/wallets" class="nav-link" :title="t('components.navbar.wallets')">
        <Icon name="material-symbols:payments-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.wallets') }}</span>
      </NuxtLink>

      <NuxtLink to="/finance/profile" class="nav-link" :title="t('components.navbar.profile')">
        <Icon name="material-symbols:person-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.profile') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
/* Component-specific styles only — shared navbar styles are in main.css */
</style>
<script setup>
import { computed } from 'vue'

const { t } = useI18n()

const menus = computed(() => [
  { 
    icon: 'material-symbols:donut-large-rounded', 
    label: t('components.navbar.analytics'), 
    to: '/finance/analytics' 
  },
  { 
    icon: 'mdi:hand-coin-outline',                     //
    label: t('components.navbar.debt'), 
    to: '/finance/debt' 
  },
  { 
    icon: 'material-symbols:widgets-outline', 
    label: 'Menu 3', 
    to: null 
  },
  { 
    icon: 'material-symbols:widgets-outline', 
    label: 'Menu 4', 
    to: null 
  },
  { 
    icon: 'material-symbols:grid-view-rounded', 
    label: t('pages.finance.index.see_all'), 
    to: null,
    isSeeAll: true 
  },
])
</script>

<template>
  <div class="finance-menu-card">
    <h3 class="menu-title">{{ t('pages.finance.index.menu_title') }}</h3>
    
    <div class="menu-list">
      <NuxtLink 
        v-for="menu in menus" 
        :key="menu.label" 
        :to="menu.to || '#'" 
        class="menu-item"
        :class="{ 'is-dummy': !menu.to && !menu.isSeeAll }"
        @click.prevent="!menu.to ? null : null"
      >
        <div class="menu-icon-bg">
          <Icon :name="menu.icon" size="24" class="menu-icon" />
        </div>
        <span class="menu-label">{{ menu.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* ========== Style tetap sama persis ========== */
.finance-menu-card {
  background: color-mix(in srgb, var(--md-sys-color-surface-container) 96%, var(--md-sys-color-primary) 4%);
  border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 20%, transparent);
  border-radius: 28px;
  padding: 24px 24px 20px;
  margin-top: 24px;
  box-shadow: 
    0 1px 3px -1px rgba(0, 0, 0, 0.1),
    0 4px 12px -2px rgba(0, 0, 0, 0.15);
  animation: enterUp 500ms cubic-bezier(0.05, 0.7, 0.1, 1) 120ms both;
}

.menu-title {
  margin: 0 0 16px;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  text-transform: uppercase;
  padding-left: 4px;
}

/* Layout: wrap & center */
.menu-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 8px;
  width: calc((100% - 48px) / 5);
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 20px;
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}

.menu-item:hover {
  background-color: var(--md-sys-color-outline-variant);
}

.menu-item:active {
  transform: scale(0.95);
}

.menu-item.is-dummy {
  opacity: 0.5;
  cursor: default;
}

.menu-item.is-dummy:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.menu-item.is-dummy:active {
  transform: none;
}

.menu-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background-color: var(--md-sys-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon {
  color: var(--md-sys-color-on-primary-container);
}

.menu-label {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  color: var(--md-sys-color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

@keyframes enterUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .finance-menu-card {
    padding: 20px 16px 16px;
    margin-top: 16px;
    border-radius: 24px;
  }
  
  .menu-item {
    width: calc((100% - 24px) / 3);
    padding: 16px 6px;
    border-radius: 16px;
  }
  
  .menu-icon-bg {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }
  
  .menu-label {
    font-size: 0.75rem;
  }
}
</style>
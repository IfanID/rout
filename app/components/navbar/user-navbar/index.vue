<script setup lang="ts">
import OwnerButton from './owner/OwnerButton.vue'

const { t } = useI18n()

const route = useRoute()
const isProfilePage = computed(() => route.path === '/profile')

// Ambil data dari Settings
const centerMenu = useState('navCenterMenu', () => 'running-man')

// Konfigurasi tombol tengah (Link & Ikon)
const centerConfig = computed(() => {
  if (centerMenu.value === 'finance') {
    return {
      to: '/finance',
      icon: 'material-symbols:finance-mode-rounded',
      title: t('components.navbar.finance')
    }
  }
  return {
    to: '/running-man',
    icon: 'material-symbols:directions-run',
    title: t('components.navbar.runningMan')
  }
})
</script>

<template>
  <nav class="navbar-wrapper">
    <OwnerButton
      v-if="isProfilePage"
      class="floating-owner-btn"
    />

    <div class="navbar">
      <NuxtLink to="/" class="nav-link" :title="t('components.navbar.home')">
        <Icon name="material-symbols:home-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.home') }}</span>
      </NuxtLink>

      <NuxtLink to="/search" class="nav-link" :title="t('components.navbar.search')">
        <Icon name="material-symbols:search-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.search') }}</span>
      </NuxtLink>

      <!-- Center Floating Button -->
      <div class="center-menu-container">
        <ClientOnly>
          <NuxtLink
            :to="centerConfig.to"
            class="center-btn"
            :title="centerConfig.title"
          >
            <Icon :name="centerConfig.icon" size="32" />
          </NuxtLink>
          
          <!-- PANGGIL KOMPONEN SKELETON -->
          <template #fallback>
            <SkeletonNavbarCenterButton />
          </template>
        </ClientOnly>
      </div>

      <NuxtLink to="/settings" class="nav-link" :title="t('components.navbar.settings')">
        <Icon name="material-symbols:settings-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.settings') }}</span>
      </NuxtLink>

      <NuxtLink to="/profile" class="nav-link" :title="t('components.navbar.profile')">
        <Icon name="material-symbols:person-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.profile') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
/* Component-specific styles only — shared navbar styles are in main.css */

.floating-owner-btn {
  position: absolute;
  top: -60px;
  right: 29px;
  z-index: 200;
}

@media (max-width: 480px) {
  .floating-owner-btn { top: -54px; right: 20px; }
  .center-btn .icon { width: 26px; height: 26px; }
  .skeleton-letter { font-size: 1rem; }
}
</style>
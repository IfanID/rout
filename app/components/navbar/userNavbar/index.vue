<script setup>
import OwnerButton from './owner/ownerButton.vue'

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
.navbar-wrapper {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.floating-owner-btn {
  position: absolute;
  top: -60px;
  right: 29px;
  z-index: 200;
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

.center-menu-container {
  position: relative;
  margin: 0 10px;
}

.center-btn {
  position: relative;
  z-index: 1000;
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
}

.center-btn:hover {
  transform: scale(1.1);
  background-color: var(--md-sys-color-primary-hover);
}


/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .navbar-wrapper { bottom: 16px; }
  .navbar { width: calc(100vw - 32px); min-width: 0; height: 64px; padding: 6px 12px; border-radius: 16px; }
  .floating-owner-btn { top: -54px; right: 20px; }
  .center-btn { width: 52px; height: 52px; margin-top: -24px; font-size: 1rem; }
  .center-btn .icon { width: 26px; height: 26px; }
  .nav-label { font-size: 0.6rem; }
  .skeleton-letter { font-size: 1rem; }
}

@media (min-width: 481px) and (max-width: 768px) {
  .navbar { width: 440px; height: 70px; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .navbar { width: 500px; }
}
</style>
<script setup>
const { t } = useI18n()

// Center button mengarah ke halaman Owner Dashboard
const centerConfig = computed(() => ({
  to: '/owner',
  icon: 'material-symbols:key-rounded',
  title: t('pages.owner.title')
}))
</script>

<template>
  <nav class="navbar-wrapper">
    <div class="navbar">
      <!-- Beranda Owner (Dashboard Owner) -->
      <NuxtLink to="/owner" class="nav-link" :title="t('components.navbar.ownerDashboard')">
        <Icon name="material-symbols:shield-person-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.ownerDashboard') }}</span>
      </NuxtLink>

      <!-- Analitik Owner -->
      <NuxtLink to="/owner/analytics" class="nav-link" :title="t('components.navbar.analytics')">
        <Icon name="material-symbols:monitoring-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.analytics') }}</span>
      </NuxtLink>

      <!-- Center: Owner Dashboard -->
      <div class="center-menu-container">
        <ClientOnly>
          <NuxtLink
            :to="centerConfig.to"
            class="center-btn"
            :title="centerConfig.title"
          >
            <Icon :name="centerConfig.icon" size="32" />
          </NuxtLink>
          <template #fallback>
            <SkeletonNavbarCenterButton />
          </template>
        </ClientOnly>
      </div>

      <!-- Manajemen User -->
      <NuxtLink to="/owner/users" class="nav-link" :title="t('components.navbar.ownerUsers')">
        <Icon name="material-symbols:group-rounded" size="24" />
        <span class="nav-label">{{ t('components.navbar.ownerUsers') }}</span>
      </NuxtLink>

<!-- Pengaturan khusus Owner -->
<NuxtLink to="/owner/settings" class="nav-link" :title="t('pages.owner.settings.title')">
  <Icon name="material-symbols:settings-rounded" size="24" />
  <span class="nav-label">{{ t('pages.owner.settings.title') }}</span>
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

/* Responsive */
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
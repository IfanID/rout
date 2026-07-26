<script setup lang="ts">
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

      <!-- Pengaturan khusus Owner -->
<NuxtLink to="/owner/settings" class="nav-link" :title="t('pages.owner.settings.title')">
  <Icon name="material-symbols:settings-rounded" size="24" />
  <span class="nav-label">{{ t('pages.owner.settings.title') }}</span>
</NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
/* Component-specific styles only — shared navbar styles are in main.css */
</style>
<!-- app/app.vue -->
<script setup>
const route = useRoute()
const { locales } = useI18n()

const localeCodes = computed(() => {
  return locales.value.map(l => (typeof l === 'object' ? l.code : l)).join('|')
})

const cleanPath = computed(() => {
  return route.path.replace(new RegExp(`^/(${localeCodes.value})/?`), '/')
})

const isFinancePage = computed(() => cleanPath.value.startsWith('/finance'))
const isOwnerPage = computed(() => cleanPath.value.startsWith('/owner'))
</script>

<template>
  <div>
    
    <AppNotification />
    <NavbarOwner v-if="isOwnerPage" />
    <NavbarFinance v-else-if="isFinancePage" />
    <NavbarUserNavbar v-else />

    <NuxtRouteAnnouncer />
    <div class="main-content">
      <NuxtPage />
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding-bottom: 120px;
}

@media (max-width: 480px) {
  .main-content {
    padding-bottom: 100px;
  }
}
</style>
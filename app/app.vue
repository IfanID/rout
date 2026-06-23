<script setup>
const route = useRoute()

// Cek apakah URL saat ini dimulai dengan /finance
const isFinancePage = computed(() => route.path.startsWith('/finance'))
</script>

<template>
  <div>
    <!-- Jika di halaman finance, tampilkan NavbarFinance -->
    <NavbarFinance v-if="isFinancePage" />
    
    <!-- Jika tidak, tampilkan UserNavbar -->
    <NavbarUserNavbar v-else />

    <NuxtRouteAnnouncer />
    
    <!-- Bungkus halaman dengan padding agar tidak tertutup navbar -->
    <div class="main-content">
      <NuxtPage />
    </div>
  </div>
</template>
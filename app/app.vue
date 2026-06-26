<script setup>
const route = useRoute()
const { locales } = useI18n()

// Ambil semua kode bahasa yang ada (misal: "id", "ko")
const localeCodes = computed(() => {
  return locales.value.map(l => (typeof l === 'object' ? l.code : l)).join('|')
})

// Cek apakah URL saat ini dimulai dengan /finance (MENGABAIKAN PREFIX BAHASA)
const isFinancePage = computed(() => {
  // Jika route.path = /ko/finance/profile, regex ini akan menghapus /ko/ menjadi /finance/profile
  // Jika route.path = /finance/profile (bahasa default), tetap /finance/profile
  const cleanPath = route.path.replace(new RegExp(`^/(${localeCodes.value})/?`), '/')
  return cleanPath.startsWith('/finance')
})
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

<style scoped>
.main-content {
  /* 
    Navbar fixed di bottom: 24px, tinggi 75px (desktop) / 64px (mobile)
    24px + 75px = 99px → dibulatkan ke 120px agar ada ruang bernapas
  */
  padding-bottom: 120px;
}

@media (max-width: 480px) {
  .main-content {
    /* Navbar mobile: bottom 16px, tinggi 64px → 80px, padding 100px cukup */
    padding-bottom: 100px;
  }
}
</style>
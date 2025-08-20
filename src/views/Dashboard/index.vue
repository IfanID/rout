<template>
  <div>
    <AppNavbar />
    <div class="dashboard-container">
      <md-card class="dashboard-card">
        <div class="card-content">
          <h1 class="card-title">Selamat Datang di Dashboard!</h1>
          <p class="card-text">Ini adalah halaman dashboard Anda. Di sini Anda dapat melihat ringkasan aktivitas dan informasi penting.</p>
          <md-text-button class="card-button">Pelajari Lebih Lanjut</md-text-button>
        </div>
      </md-card>
    </div>
  </div>
</template>

<script>
import AppNavbar from '@/components/Navbar/index.vue';

export default {
  name: 'DashboardView',
  components: {
    AppNavbar,
  },
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - var(--navbar-height, 64px)); /* Adjust based on navbar height */
  padding: 1rem;
  background-color: var(--md-sys-color-background);
}

.dashboard-card {
  width: 100%;
  max-width: 600px;
  padding: 1.5rem;
  border-radius: 28px; /* Prominently rounded corners */
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-1); /* Material You elevation */
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title {
  font-family: 'Google Sans Text', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 0.5rem;
}

.card-text {
  font-family: 'Google Sans Text', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 1rem;
}

.card-button {
  align-self: flex-start;
  --md-sys-color-primary: var(--md-sys-color-primary); /* Ensure button uses primary color */
  --md-sys-color-on-primary: var(--md-sys-color-on-primary);
}
</style>

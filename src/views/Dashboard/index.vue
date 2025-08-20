<template>
  <div class="page-container">
    <Navbar />
    <div class="dashboard-container">
      <main class="content-area">
        <div class="card">
          <h2>Selamat Datang</h2>
          <p>Ini adalah halaman utama aplikasi Anda. Silakan jelajahi.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar/index.vue';

export default {
  name: 'DashboardView',
  components: {
    Navbar,
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--md-sys-color-background);
}

.dashboard-container {
  flex-grow: 1;
  display: flex;
  justify-content: center; /* Center content vertically */
  align-items: center; /* Center content horizontally */
  overflow-y: auto;
}

.content-area {
  padding: 24px;
  width: 100%;
}

.card {
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  padding: 24px;
  border-radius: 16px; /* Prominently rounded corners */
  max-width: 800px;
  margin: 0 auto;
}

.card h2 {
  margin-top: 0;
  font-size: 24px;
  font-weight: 700;
}
</style>

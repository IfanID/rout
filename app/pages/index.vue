<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="home-page">
    
    <!-- Header kiri atas -->
    <header class="header-content">
      <h1 class="brand-name">ROut</h1>

      <p class="welcome-text">
        {{ t('pages.index.welcome_back') }}
        <span class="username">{{ t('pages.index.guest') }}</span>
      </p>
    </header>

    <!-- Greeting atas tengah -->
    <div class="greeting">
      <p>{{ t('pages.index.greeting') }}</p>
    </div>

  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 60px;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  display: flex;
  flex-direction: column;
}

.header-content {
  width: 100%;
}

.brand-name {
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.welcome-text {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  color: var(--md-sys-color-on-surface-variant);
}

.username {
  color: var(--md-sys-color-primary);
  font-weight: 600;
}

.greeting {
  align-self: center;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}
</style>
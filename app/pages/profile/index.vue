<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="page-container">
    <h1>{{ t('pages.profile.title') }}</h1>
    
    <div class="profile-card">
      <Icon name="material-symbols:person-rounded" size="64" class="profile-icon" />
      <h2>{{ t('pages.profile.guest') }}</h2>
      <p class="email">{{ t('pages.profile.email') }}</p>
    </div>

    <div class="info-text">
      <p>{{ t('pages.profile.info') }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 40px 20px;
  color: var(--md-sys-color-on-surface);
}

h1 {
  color: var(--md-sys-color-primary);
  margin-bottom: 24px;
}

.profile-card {
  background-color: var(--md-sys-color-surface-container);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.profile-icon {
  color: var(--md-sys-color-primary);
  margin-bottom: 12px;
}

h2 {
  margin: 8px 0 4px;
  color: var(--md-sys-color-on-surface);
}

.email {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.9rem;
}

.info-text {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 12px;
  font-size: 0.9rem;
}
</style>
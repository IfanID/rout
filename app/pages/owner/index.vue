<script setup>
const { t } = useI18n()
</script>

<template>
  <div class="page-container">
    <h1>{{ t('pages.owner.title') }}</h1>
    
    <div class="owner-card">
      <Icon name="material-symbols:key-rounded" size="48" class="owner-icon" />
      <h2>{{ t('pages.owner.card_title') }}</h2>
      <p>{{ t('pages.owner.card_desc') }}</p>
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

.owner-card {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.owner-icon {
  margin-bottom: 12px;
}

h2 {
  margin: 8px 0 4px;
}

p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
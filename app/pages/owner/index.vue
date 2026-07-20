<script setup>
const { t } = useI18n()

const menus = computed(() => [
  {
    icon: 'material-symbols:storage-rounded',
    label: t('pages.owner.local_data.title'),   // ✅ perbaikan: ambil .title
    to: '/owner/local-data'
  },
  // ... nanti bisa ditambah menu lain
])
</script>

<template>
  <div class="page-container">
    <h1>{{ t('pages.owner.title') }}</h1>

    <div class="owner-card">
      <Icon name="material-symbols:key-rounded" size="48" class="owner-icon" />
      <h2>{{ t('pages.owner.card_title') }}</h2>
      <p>{{ t('pages.owner.card_desc') }}</p>
    </div>

    <!-- Menu Grid -->
    <div class="menu-grid">
      <NuxtLink
        v-for="menu in menus"
        :key="menu.label"
        :to="menu.to"
        class="menu-item"
      >
        <div class="menu-icon-bg">
          <Icon :name="menu.icon" size="24" />
        </div>
        <span class="menu-label">{{ menu.label }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 40px 20px 120px;
  color: var(--md-sys-color-on-surface);
  max-width: 600px;
  margin: 0 auto;
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
  margin-bottom: 32px;
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

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 8px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 20px;
  color: var(--md-sys-color-on-surface);
  text-decoration: none;
  transition: transform 0.15s, background-color 0.2s;
  cursor: pointer;
}

.menu-item:hover {
  background-color: var(--md-sys-color-outline-variant);
}

.menu-item:active {
  transform: scale(0.95);
}

.menu-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background-color: var(--md-sys-color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--md-sys-color-on-primary-container);
}

.menu-label {
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}
</style>
<script setup>
import OwnerButton from './owner/ownerButton.vue'

const route = useRoute()

const isProfilePage = computed(() => route.path === '/users/profile')
</script>

<template>
  <nav class="navbar-wrapper">
    <OwnerButton
      v-if="isProfilePage"
      class="floating-owner-btn"
    />

    <div class="navbar">
      <NuxtLink
        to="/"
        class="nav-link"
        title="Home"
      >
        <Icon
          name="material-symbols:home-rounded"
          size="24"
        />
        <span class="nav-label">Home</span>
      </NuxtLink>

      <NuxtLink
        to="/users/search"
        class="nav-link"
        title="Search"
      >
        <Icon
          name="material-symbols:search-rounded"
          size="24"
        />
        <span class="nav-label">Search</span>
      </NuxtLink>

      <!-- Center Floating Button -->
      <div class="center-menu-container">
        <NuxtLink
          to="/users/running-man"
          class="center-btn"
          title="Running Man"
        >
          <Icon
            name="material-symbols:directions-run"
            size="32"
          />
        </NuxtLink>
      </div>

      <NuxtLink
        to="/users/settings"
        class="nav-link"
        title="Settings"
      >
        <Icon
          name="material-symbols:settings-rounded"
          size="24"
        />
        <span class="nav-label">Settings</span>
      </NuxtLink>

      <NuxtLink
        to="/users/profile"
        class="nav-link"
        title="Profile"
      >
        <Icon
          name="material-symbols:person-rounded"
          size="24"
        />
        <span class="nav-label">Profile</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.navbar-wrapper {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

/* Floating owner button */
.floating-owner-btn {
  position: absolute;
  top: -60px;
  right: 39px;
  z-index: 200;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-around;

  width: 380px;
  height: 75px;

  padding: 8px 16px;

  /* GANTI KE MATERIAL YOU */
  background-color: var(--md-sys-color-surface-container);

  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;

  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  color: var(--md-sys-color-on-surface-variant);
  text-decoration: none;
  font-weight: 500;

  transition: var(--transition);

  -webkit-tap-highlight-color: transparent;
}

.nav-link:hover {
  color: var(--md-sys-color-primary);
}

.nav-label {
  font-size: 0.7rem;
}

/* Center floating menu */
.center-menu-container {
  position: relative;
  margin: 0 10px;
}

.center-btn {
  position: relative;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 64px;
  height: 64px;

  margin-top: -30px;

  /* GANTI KE MATERIAL YOU */
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);

  border-radius: 50%;
  border: 6px solid var(--md-sys-color-surface-container); /* Samakan dengan bg navbar */

  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 800;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  transition: var(--transition);

  -webkit-tap-highlight-color: transparent;
}

.center-btn:hover {
  transform: scale(1.1);
  background-color: var(--md-sys-color-primary-hover);
}

/* ===== RESPONSIVE ===== */

@media (max-width: 480px) {
  .navbar-wrapper {
    bottom: 16px;
  }

  .navbar {
    width: calc(100vw - 32px);
    min-width: 0;

    height: 64px;

    padding: 6px 12px;

    border-radius: 16px;
  }

  .floating-owner-btn {
    top: -54px;
    right: 20px;
  }

  .center-btn {
    width: 52px;
    height: 52px;

    margin-top: -24px;

    font-size: 1rem;
  }

  .center-btn .icon {
    width: 26px;
    height: 26px;
  }

  .nav-label {
    font-size: 0.6rem;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .navbar {
    width: 440px;
    height: 70px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .navbar {
    width: 500px;
  }
}
</style>
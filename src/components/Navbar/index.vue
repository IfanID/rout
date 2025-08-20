<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/favicon.ico" alt="ROut Icon" class="navbar-icon" />
      <span class="server-name">ROut</span>
    </div>
    <div class="navbar-right">
      <md-icon-button class="profile-button">
        <span class="material-symbols-outlined">person</span>
      </md-icon-button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar',
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px; /* Standard Material You app bar height */
  padding: 0 16px; /* Standard Material You padding */
  background-color: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--md-sys-elevation-1);
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px; /* Standard Material You spacing */
}

.navbar-icon {
  width: 24px;
  height: 24px;
}

.server-name {
  font-family: 'Google Sans Text', sans-serif;
  font-size: 1.25rem; /* Larger font for prominence */
  font-weight: 500;
  letter-spacing: 0.0125em; /* Material You letter spacing */
}

.profile-button {
  --md-sys-color-on-surface: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-secondary-container);
  border-radius: 50%;
  width: 40px; /* Adjust size to fit the icon and padding */
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Desktop Styles */
@media (min-width: 768px) {
  .navbar {
    padding: 0 24px;
  }
}
</style>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/favicon.ico" alt="ROut Icon" class="navbar-icon" />
      <span class="server-name">ROut</span>
    </div>
    <div class="navbar-right">
      </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Increased gap for the icon */
}

.navbar-icon {
  width: 24px;
  height: 24px;
}

.server-name {
  font-size: 1.1rem; /* Slightly larger font */
  font-weight: 500;
}

/* Desktop Styles */
@media (min-width: 768px) {
  .navbar {
    padding: 0.75rem 1.5rem;
  }
}
</style>

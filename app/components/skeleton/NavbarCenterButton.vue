<template>
  <div class="center-btn skeleton-btn">
    <span class="skeleton-letter">R</span>
  </div>
</template>

<style scoped>
.center-btn {
  position: relative;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-top: -30px;
  border-radius: 50%;
  border: 6px solid var(--md-sys-color-surface-container);
  -webkit-tap-highlight-color: transparent;
  pointer-events: none; /* Tidak bisa diklik saat loading */
}

.skeleton-btn {
  background: linear-gradient(90deg, var(--md-sys-color-surface-variant) 25%, var(--md-sys-color-outline-variant) 50%, var(--md-sys-color-surface-variant) 75%);
  background-size: 200% 100%;
  animation: cms-shimmer 1.5s infinite;
}

.skeleton-letter {
  color: var(--md-sys-color-primary);
  font-weight: 800;
  font-size: 1.2rem;
  user-select: none;
}

@keyframes cms-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .center-btn {
    width: 52px;
    height: 52px;
    margin-top: -24px;
  }
  .skeleton-letter {
    font-size: 1rem;
  }
}
</style>
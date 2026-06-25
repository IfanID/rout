<template>
  <div class="skeleton-wrapper">
    <span class="skeleton-text">
      <span class="skeleton-shine"></span>
    </span>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  position: relative;
  width: 70px;
  height: 16px;
  border-radius: 6px;
  /* Warna base lebih halus dengan sedikit warna primary */
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, var(--md-sys-color-surface-variant));
  /* Tepi primary yang elegan */
  border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 25%, var(--md-sys-color-outline-variant));
  /* Inner shadow untuk efek 3D kedalam */
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.2),
    0 0 8px color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent);
  /* Animasi glow berdenyut */
  animation: skeleton-pulse 2s ease-in-out infinite;
  overflow: hidden;
}

.skeleton-text {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  background-color: color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent);
  position: relative;
  overflow: hidden;
}

/* Cahaya kilau (shine) yang bergerak dari kiri ke kanan */
.skeleton-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg, 
    transparent 0%, 
    color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent) 50%, 
    transparent 100%
  );
  animation: skeleton-shine-move 2s infinite;
  transform: skewX(-20deg);
}

/* Animasi Cahaya Kilau Bergerak */
@keyframes skeleton-shine-move {
  0% { left: -100%; }
  100% { left: 150%; }
}

/* Animasi Glow Berdenyut */
@keyframes skeleton-pulse {
  0%, 100% { 
    opacity: 0.7;
    box-shadow: 
      inset 0 1px 2px rgba(0, 0, 0, 0.2),
      0 0 6px color-mix(in srgb, var(--md-sys-color-primary) 20%, transparent);
  }
  50% { 
    opacity: 1;
    box-shadow: 
      inset 0 1px 2px rgba(0, 0, 0, 0.1),
      0 0 14px color-mix(in srgb, var(--md-sys-color-primary) 50%, transparent);
  }
}
</style>
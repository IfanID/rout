<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="skeleton-amount" aria-hidden="true">
    <!-- Ghost: teks asli tapi invisible — dialokasikan ruang persis seperti nominal nyata -->
    <span class="skeleton-ghost">{{ text }}</span>
    <!-- Fill: shimmer overlay yang menutupi area ghost -->
    <span class="skeleton-fill"></span>
  </span>
</template>

<style scoped>
.skeleton-amount {
  position: relative;
  display: inline-block;
  /* Warisi properti font dari parent agar ghost memiliki dimensi identik */
  font-variant-numeric: tabular-nums;
  letter-spacing: inherit;
  font-weight: inherit;
}

/* Teks tak terlihat yang "membooking" ruang persis */
.skeleton-ghost {
  visibility: hidden;
  white-space: nowrap;
  user-select: none;
}

/* Shimmer yang menutupi area ghost */
.skeleton-fill {
  position: absolute;
  /* Sedikit padding vertikal agar shimmer tidak terlalu tipis */
  top: 0.08em;
  bottom: 0.12em;
  /* Sedikit melebar agar tidak terlalu pas di tepi huruf */
  left: -0.06em;
  right: -0.06em;
  background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, var(--md-sys-color-surface-variant));
  border: 1px solid color-mix(in srgb, var(--md-sys-color-primary) 25%, var(--md-sys-color-outline-variant));
  border-radius: 0.2em;
  overflow: hidden;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.15),
    0 0 8px color-mix(in srgb, var(--md-sys-color-primary) 25%, transparent);
  animation: skeleton-pulse 2s ease-in-out infinite;
}

/* Efek kilau bergerak */
.skeleton-fill::after {
  content: '';
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
  animation: skeleton-shine 2s infinite;
  transform: skewX(-20deg);
}

@keyframes skeleton-shine {
  0% { left: -100%; }
  100% { left: 150%; }
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.75;
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.15),
      0 0 6px color-mix(in srgb, var(--md-sys-color-primary) 15%, transparent);
  }
  50% {
    opacity: 1;
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.1),
      0 0 14px color-mix(in srgb, var(--md-sys-color-primary) 40%, transparent);
  }
}
</style>
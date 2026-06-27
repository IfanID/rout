<script setup>
defineProps({
  text: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="skeleton-amount" aria-hidden="true">
    <span class="skeleton-ghost">{{ text }}</span>
    <span class="skeleton-fill"></span>
  </span>
</template>

<style scoped>
.skeleton-amount {
  position: relative;
  display: inline-block;
  font-variant-numeric: tabular-nums;
  letter-spacing: inherit;
  font-weight: inherit;
}

.skeleton-ghost {
  visibility: hidden;
  white-space: nowrap;
  user-select: none;
}

.skeleton-fill {
  position: absolute;
  top: 0.08em;
  bottom: 0.12em;
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
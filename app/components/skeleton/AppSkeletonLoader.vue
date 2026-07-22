<script setup>
/**
 * AppSkeletonLoader
 * -----------------
 * Komponen Skeleton Loading universal untuk seluruh aplikasi.
 * Menampilkan logo aplikasi (rout.png - 1000×1000px) di dalam lingkaran
 * dengan animasi halus. Mendukung Light Mode & Dark Mode otomatis.
 *
 * @example
 * <SkeletonAppSkeletonLoader :show="loading" fullscreen />
 * <SkeletonAppSkeletonLoader :show="loading" size="sm" overlay />
 */
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
  overlay: {
    type: Boolean,
    default: false,
  },
})

const sizeMap = {
  sm: {
    circle: 80,
    logo: 52,
    border: 2,
    ring: 2,
    glowBlur: 8,
    padding: 3,
    dotSize: 5,
    orbitRadius: 52,
  },
  md: {
    circle: 140,
    logo: 92,
    border: 3,
    ring: 3,
    glowBlur: 12,
    padding: 4,
    dotSize: 7,
    orbitRadius: 88,
  },
  lg: {
    circle: 200,
    logo: 132,
    border: 4,
    ring: 4,
    glowBlur: 16,
    padding: 5,
    dotSize: 9,
    orbitRadius: 126,
  },
}

const getSizeConfig = (size) => sizeMap[size] || sizeMap.md
</script>

<template>
  <Transition name="skeleton-fade">
    <div
      v-if="show"
      class="app-skeleton"
      :class="{
        'app-skeleton--fullscreen': fullscreen,
        'app-skeleton--overlay': overlay,
      }"
    >
      <div class="app-skeleton__content">
        <div class="app-skeleton__wrapper">
          <!-- Glow (tanpa blur berlebihan, subtle saja) -->
          <div
            class="app-skeleton__glow"
            :style="{
              width: `${getSizeConfig(size).circle * 1.1}px`,
              height: `${getSizeConfig(size).circle * 1.1}px`,
              filter: `blur(${getSizeConfig(size).glowBlur}px)`,
            }"
          ></div>

          <!-- Orbit dots (3 titik kecil mengitari) -->
          <div
            class="app-skeleton__orbit"
            :style="{
              width: `${getSizeConfig(size).orbitRadius * 2}px`,
              height: `${getSizeConfig(size).orbitRadius * 2}px`,
            }"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="app-skeleton__orbit-dot"
              :style="{
                width: `${getSizeConfig(size).dotSize}px`,
                height: `${getSizeConfig(size).dotSize}px`,
                '--orbit-delay': `${(i - 1) * 0.4}s`,
              }"
            ></div>
          </div>

          <!-- Lingkaran utama -->
          <div
            class="app-skeleton__circle"
            :style="{
              width: `${getSizeConfig(size).circle}px`,
              height: `${getSizeConfig(size).circle}px`,
              borderWidth: `${getSizeConfig(size).border}px`,
            }"
          >
            <!-- Rotating ring -->
            <div
              class="app-skeleton__ring"
              :style="{
                borderWidth: `${getSizeConfig(size).ring}px`,
              }"
            ></div>

            <!-- Logo -->
            <div
              class="app-skeleton__logo-wrap"
              :style="{
                width: `${getSizeConfig(size).logo}px`,
                height: `${getSizeConfig(size).logo}px`,
                padding: `${getSizeConfig(size).padding}px`,
              }"
            >
              <img
                src="/rout.png"
                alt="Rout"
                class="app-skeleton__logo"
                width="1000"
                height="1000"
                decoding="async"
              />
            </div>
          </div>
        </div>

        <!-- Pulse dots + label di bawah -->
        <div class="app-skeleton__footer">
          <div class="app-skeleton__dots">
            <span class="app-skeleton__dot"></span>
            <span class="app-skeleton__dot"></span>
            <span class="app-skeleton__dot"></span>
          </div>
          <span class="app-skeleton__label">Memuat</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ============================================ */
/* ROOT CONTAINER                               */
/* ============================================ */
.app-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  min-height: 320px;
  background-color: var(--md-sys-color-background, var(--md-sys-color-surface, #fafafa));
  color: var(--md-sys-color-on-surface, #1c1b1f);
  transition: background-color 0.3s ease;
}

.app-skeleton--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  min-height: 100vh;
  padding: 0;
}

.app-skeleton--overlay {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-background, var(--md-sys-color-surface, #fafafa)) 92%,
    transparent
  );
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ============================================ */
/* CONTENT (vertical layout)                    */
/* ============================================ */
.app-skeleton__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

/* ============================================ */
/* WRAPPER                                      */
/* ============================================ */
.app-skeleton__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ============================================ */
/* LINGKARAN UTAMA                              */
/* ============================================ */
.app-skeleton__circle {
  position: relative;
  border-radius: 50%;
  border-style: solid;
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #06b6d4) 20%,
    transparent
  );
  background-color: var(--md-sys-color-surface, var(--md-sys-color-background, #ffffff));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 2px 12px color-mix(
      in srgb,
      var(--md-sys-color-primary, #06b6d4) 10%,
      transparent
    ),
    0 1px 3px color-mix(
      in srgb,
      var(--md-sys-color-on-surface, #000000) 5%,
      transparent
    ),
    inset 0 1px 2px color-mix(
      in srgb,
      var(--md-sys-color-surface, #ffffff) 50%,
      transparent
    );
  animation: skeleton-pulse 2.4s ease-in-out infinite;
  overflow: hidden;
  z-index: 2;
}

/* ============================================ */
/* ROTATING RING                                */
/* ============================================ */
.app-skeleton__ring {
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
  border-top-color: var(--md-sys-color-primary, #06b6d4);
  border-right-color: color-mix(
    in srgb,
    var(--md-sys-color-primary, #06b6d4) 30%,
    transparent
  );
  animation: skeleton-rotate 2.8s linear infinite;
  pointer-events: none;
}

/* ============================================ */
/* LOGO                                         */
/* ============================================ */
.app-skeleton__logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16%;
  overflow: hidden;
  animation: skeleton-scale 2.4s ease-in-out infinite;
}

.app-skeleton__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
}

/* ============================================ */
/* GLOW (subtle, no heavy blur)                 */
/* ============================================ */
.app-skeleton__glow {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--md-sys-color-primary, #06b6d4) 18%, transparent) 0%,
    transparent 70%
  );
  opacity: 0.4;
  z-index: 1;
  animation: skeleton-glow 2.4s ease-in-out infinite;
  pointer-events: none;
}

/* ============================================ */
/* ORBIT DOTS (3 titik mengitari lingkaran)     */
/* ============================================ */
.app-skeleton__orbit {
  position: absolute;
  border-radius: 50%;
  animation: skeleton-orbit 6s linear infinite;
  z-index: 3;
  pointer-events: none;
}

.app-skeleton__orbit-dot {
  position: absolute;
  border-radius: 50%;
  background-color: var(--md-sys-color-primary, #06b6d4);
  opacity: 0.6;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  animation: skeleton-orbit-dot-pulse 1.8s ease-in-out infinite;
  animation-delay: var(--orbit-delay);
}

.app-skeleton__orbit-dot:nth-child(2) {
  top: 6.7%;
  left: 75%;
}

.app-skeleton__orbit-dot:nth-child(3) {
  top: 93.3%;
  left: 75%;
}

/* ============================================ */
/* FOOTER (dots + label)                        */
/* ============================================ */
.app-skeleton__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.app-skeleton__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.app-skeleton__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--md-sys-color-primary, #06b6d4);
  opacity: 0.4;
  animation: skeleton-dot-bounce 1.4s ease-in-out infinite;
}

.app-skeleton__dot:nth-child(2) {
  animation-delay: 0.16s;
}

.app-skeleton__dot:nth-child(3) {
  animation-delay: 0.32s;
}

.app-skeleton__label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.8px;
  color: var(--md-sys-color-on-surface-variant, #64748b);
  text-transform: uppercase;
  animation: skeleton-label-fade 2s ease-in-out infinite;
}

/* ============================================ */
/* ANIMATIONS                                   */
/* ============================================ */
@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.95;
    transform: translateY(-2px);
  }
}

@keyframes skeleton-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes skeleton-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes skeleton-glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.08);
  }
}

@keyframes skeleton-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes skeleton-orbit-dot-pulse {
  0%, 100% { opacity: 0.3; transform: translateY(-50%) scale(0.8); }
  50% { opacity: 0.8; transform: translateY(-50%) scale(1.2); }
}

@keyframes skeleton-dot-bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes skeleton-label-fade {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ============================================ */
/* TRANSITION                                   */
/* ============================================ */
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.3s ease;
}

.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
  opacity: 0;
}

/* ============================================ */
/* RESPONSIVE                                   */
/* ============================================ */
@media (max-width: 480px) {
  .app-skeleton {
    min-height: 240px;
    padding: 32px 12px;
  }
  .app-skeleton__content {
    gap: 22px;
  }
}

/* ============================================ */
/* REDUCED MOTION                               */
/* ============================================ */
@media (prefers-reduced-motion: reduce) {
  .app-skeleton__circle,
  .app-skeleton__ring,
  .app-skeleton__logo-wrap,
  .app-skeleton__glow,
  .app-skeleton__orbit,
  .app-skeleton__orbit-dot,
  .app-skeleton__dot,
  .app-skeleton__label {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>

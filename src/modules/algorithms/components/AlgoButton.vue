<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'primary' | 'secondary' | 'quiet'; icon?: boolean }>(), {
  variant: 'secondary',
  icon: false,
})
</script>
<template>
  <button type="button" class="algo-button" :class="[variant, { 'icon-only': icon }]">
    <slot />
  </button>
</template>
<style scoped>
.algo-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--algo-space-2);
  height: 36px;
  padding: 0 var(--algo-space-3);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  font-size: var(--algo-text-base);
  font-weight: 500;
  color: var(--algo-secondary);
  background: var(--algo-paper);
  white-space: nowrap;
  transition:
    background var(--algo-motion),
    border-color var(--algo-motion),
    color var(--algo-motion);
}
.algo-button:hover:not(:disabled) {
  background: var(--algo-soft);
  border-color: var(--algo-accent-line);
  color: var(--algo-accent);
}
.primary {
  background: var(--algo-accent);
  border-color: var(--algo-accent);
  color: var(--algo-paper);
  padding: 0 var(--algo-space-5);
}
.primary:hover:not(:disabled) {
  background: var(--algo-accent-hover);
  color: var(--algo-paper);
  border-color: var(--algo-accent-hover);
}
.quiet {
  background: transparent;
  border-color: transparent;
}
.icon-only {
  width: 36px;
  padding: 0;
}
.algo-button:disabled {
  opacity: 0.4;
}
</style>

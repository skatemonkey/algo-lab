<script setup lang="ts">
defineProps<{ selected: 'first' | 'last' | null; label: string }>()
const emit = defineEmits<{ select: [pair: 'first' | 'last'] }>()
</script>

<template>
  <div class="case-switch" role="group" :aria-label="label">
    <button type="button" :aria-pressed="selected === 'first'" @click="emit('select', 'first')">
      First pair
    </button>
    <button type="button" :aria-pressed="selected === 'last'" @click="emit('select', 'last')">
      Last pair
    </button>
  </div>
</template>

<style scoped>
.case-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  gap: var(--algo-space-1);
}
button {
  border: 0;
  border-radius: 4px;
  padding: var(--algo-space-2) var(--algo-space-3);
  font: inherit;
  color: var(--algo-muted);
  background: transparent;
  cursor: pointer;
}
button[aria-pressed='true'] {
  background: var(--algo-paper);
  color: var(--algo-accent);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--algo-ink) 8%, transparent);
}
</style>

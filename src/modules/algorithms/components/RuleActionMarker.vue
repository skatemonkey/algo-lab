<script setup lang="ts">
defineProps<{ step: number; active?: boolean }>()
</script>

<template>
  <span class="rule-action-marker algo-mono" :class="{ active }" aria-hidden="true">
    {{ step }}
  </span>
</template>

<style scoped>
.rule-action-marker {
  position: absolute;
  z-index: 5;
  top: -7px;
  right: -7px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border: 1px solid var(--algo-accent-line);
  border-radius: 50%;
  background: var(--algo-paper);
  color: var(--algo-accent);
  font-size: var(--algo-text-xs);
  line-height: 1;
  pointer-events: none;
}
.rule-action-marker.active {
  border-color: var(--algo-accent);
  background: var(--algo-accent-line);
}
</style>

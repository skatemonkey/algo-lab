<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import type { LessonSource } from '../domain/lesson'

defineProps<{ sources: readonly LessonSource[] }>()
</script>

<template>
  <nav class="lesson-sources" aria-label="Problem sources">
    <a
      v-for="source in sources"
      :key="source.url"
      :href="source.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{{ source.label }}</span>
      <ArrowUpRight :size="14" aria-hidden="true" />
    </a>
  </nav>
</template>

<style scoped>
.lesson-sources {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: var(--algo-space-2) var(--algo-space-5);
  max-width: 320px;
  font-size: var(--algo-text-base);
}
.lesson-sources a {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-1);
  padding-block: var(--algo-space-1);
  color: var(--algo-secondary);
  text-decoration: none;
}
.lesson-sources a:hover {
  color: var(--algo-accent);
}
.lesson-sources a:hover span {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.lesson-sources svg {
  flex-shrink: 0;
}
</style>

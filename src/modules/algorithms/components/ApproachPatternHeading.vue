<script setup lang="ts">
import { ChevronRight, Split } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import type { LessonApproach } from '../domain/lesson'

defineProps<{
  pattern: LessonApproach['pattern']
  variation: string
  technique?: string
}>()
</script>

<template>
  <div class="pattern-heading" aria-label="Pattern">
    <div class="pattern-symbol" aria-hidden="true">
      <slot name="symbol"><Split :size="22" :stroke-width="1.7" /></slot>
    </div>
    <div class="pattern-path">
      <span class="pattern-label">Pattern</span>
      <div class="pattern-name">
        <RouterLink
          v-if="pattern.routeName"
          :to="{ name: pattern.routeName }"
          class="pattern-family"
        >
          {{ pattern.label }}
        </RouterLink>
        <span v-else class="pattern-family">{{ pattern.label }}</span>
        <ChevronRight :size="15" aria-hidden="true" />
        <span class="pattern-variation">{{ variation }}</span>
        <template v-if="technique">
          <ChevronRight :size="15" aria-hidden="true" />
          <span class="pattern-variation">{{ technique }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pattern-heading {
  --pattern-heading-size: var(--algo-space-12);
  display: grid;
  grid-template-columns: var(--pattern-heading-size) minmax(430px, max-content);
  align-items: stretch;
  gap: var(--algo-space-3);
}
.pattern-symbol {
  display: grid;
  place-items: center;
  min-height: var(--pattern-heading-size);
  border-radius: var(--algo-radius);
  background: var(--algo-pattern-fill);
  color: var(--algo-pattern);
}
.pattern-path {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2px;
  min-height: var(--pattern-heading-size);
  padding: var(--algo-space-1) 14px;
  border-left: 2px solid var(--algo-pattern);
  border-radius: var(--algo-radius-sm) 0 0 var(--algo-radius-sm);
  background: linear-gradient(90deg, var(--algo-pattern-soft), var(--algo-canvas));
}
.pattern-label {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
  line-height: 14px;
}
.pattern-name {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  font-size: 20px;
  line-height: 24px;
  letter-spacing: -0.4px;
  white-space: nowrap;
}
.pattern-family {
  color: var(--algo-ink);
  font-weight: 650;
  text-decoration: none;
}
.pattern-name a:hover {
  color: var(--algo-pattern);
}
.pattern-name svg {
  flex-shrink: 0;
  color: var(--algo-muted);
}
.pattern-variation {
  color: var(--algo-ink);
  font-weight: 500;
}
</style>

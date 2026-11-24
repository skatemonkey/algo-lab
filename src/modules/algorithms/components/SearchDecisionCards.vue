<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@lucide/vue'
import type { SearchDecisionCase } from '../domain/searchPresentation'

defineProps<{
  cases: readonly SearchDecisionCase[]
  outcome: boolean | null
}>()
</script>

<template>
  <ul class="search-decisions" aria-label="Midpoint decisions">
    <li
      v-for="rule in cases"
      :key="String(rule.value)"
      class="decision-case"
      :class="{ 'is-active': outcome === rule.value }"
      :aria-current="outcome === rule.value ? 'true' : undefined"
    >
      <code class="rule-condition">{{ rule.condition }}</code>
      <span class="rule-action">
        <span v-if="rule.save">{{ rule.save + ' · ' }}</span>
        <span class="rule-direction">
          <ArrowLeft v-if="rule.direction === 'left'" :size="14" aria-hidden="true" />
          <span>{{ rule.action }}</span>
          <ArrowRight v-if="rule.direction === 'right'" :size="14" aria-hidden="true" />
        </span>
      </span>
      <slot name="details" :rule="rule" />
    </li>
  </ul>
</template>

<style scoped>
.search-decisions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--algo-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.decision-case {
  display: flex;
  flex-direction: column;
  gap: var(--algo-space-2);
  padding: var(--algo-space-3);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-paper);
  box-shadow: inset 2px 0 0 transparent;
  transition:
    background var(--algo-motion),
    border-color var(--algo-motion),
    box-shadow var(--algo-motion);
}
.decision-case.is-active {
  border-color: var(--algo-selected-line);
  background: var(--algo-selected-soft);
  box-shadow: inset 2px 0 0 var(--algo-ink);
}
.rule-condition {
  color: var(--algo-ink);
  font: 700 var(--algo-text-body) / var(--algo-space-5) var(--algo-mono);
  font-variant-ligatures: none;
  white-space: nowrap;
}
.rule-action {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--algo-space-1);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
  font-weight: 400;
  line-height: var(--algo-space-5);
}
.rule-direction {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-1);
  white-space: nowrap;
}
.rule-action svg {
  flex: 0 0 auto;
}
.decision-case.is-active .rule-action {
  color: var(--algo-ink);
}
@media (prefers-reduced-motion: reduce) {
  .decision-case {
    transition: none;
  }
}
</style>

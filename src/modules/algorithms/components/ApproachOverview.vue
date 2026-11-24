<script setup lang="ts">
import type { LessonApproach } from '../domain/lesson'

defineProps<{ steps: LessonApproach['steps'] }>()
</script>

<template>
  <ol class="approach-steps" aria-label="Approach steps">
    <li v-for="(step, index) in steps" :key="step.id" class="approach-step">
      <span class="flow-number algo-mono" aria-hidden="true">{{ index + 1 }}</span>
      <div class="step-body">
        <header class="step-heading">
          <h2>{{ step.title }}</h2>
          <p
            v-if="step.detail"
            class="step-detail"
            :class="{ 'return-rule': step.id === 'return' }"
          >
            {{ step.detail }}
          </p>
        </header>
        <slot :step="step" />
      </div>
    </li>
  </ol>
</template>

<style scoped>
.approach-steps {
  display: grid;
  grid-template-columns: var(
    --approach-columns,
    minmax(0, 1fr) minmax(24rem, 1.5fr) minmax(0, 1fr)
  );
  gap: var(--algo-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.approach-step {
  display: grid;
  grid-template-columns: var(--algo-space-6) minmax(0, 1fr);
  column-gap: var(--algo-space-2);
}
.flow-number {
  display: grid;
  place-items: center;
  width: var(--algo-space-6);
  height: var(--algo-space-6);
  border: 1px solid var(--algo-line);
  border-radius: 50%;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.step-body {
  min-width: 0;
}
.step-heading {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-4);
  min-height: var(--algo-space-6);
}
.step-heading h2 {
  color: var(--algo-ink);
  font-size: var(--algo-text-body);
  font-weight: 500;
  line-height: var(--algo-space-6);
}
.step-detail {
  margin: 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
}
</style>

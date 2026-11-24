<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@lucide/vue'
import LessonSourceLinks from './LessonSourceLinks.vue'
import QuestionNavigation from './QuestionNavigation.vue'
import type { LessonProblem } from '../domain/lesson'

const props = defineProps<{ problem: LessonProblem }>()
const sources = computed(
  () => props.problem.sources ?? (props.problem.source ? [props.problem.source] : []),
)
</script>

<template>
  <header class="lesson-heading">
    <div class="heading-row">
      <RouterLink
        :to="{ name: 'algorithms' }"
        class="questions-back"
        aria-label="Back to questions"
        title="Back to questions"
      >
        <ArrowLeft :size="19" />
      </RouterLink>
      <h1>{{ problem.title }}</h1>
      <div class="heading-actions">
        <LessonSourceLinks v-if="sources.length" :sources="sources" />
        <slot />
        <QuestionNavigation />
      </div>
    </div>
    <div class="problem-details">
      <p class="problem-description" data-testid="problem-description">{{ problem.description }}</p>
      <div
        v-for="(example, index) in problem.examples"
        :key="index"
        class="problem-example"
        :aria-label="problem.examples.length > 1 ? `Example ${index + 1}` : 'Example'"
      >
        <span>Example{{ problem.examples.length > 1 ? ` ${index + 1}` : '' }}</span>
        <code data-testid="example-input" aria-label="Example input">
          {{ example.input }}
        </code>
        <ArrowRight :size="14" aria-hidden="true" />
        <span class="algo-sr-only">returns</span>
        <code class="example-output" data-testid="example-output" aria-label="Example output">
          {{ example.output }}
        </code>
      </div>
    </div>
  </header>
</template>

<style scoped>
.lesson-heading {
  margin-bottom: var(--algo-space-8);
}
.heading-row {
  display: flex;
  align-items: center;
  gap: var(--algo-space-5);
}
.questions-back {
  display: grid;
  place-items: center;
  width: 32px;
  height: 36px;
  flex-shrink: 0;
  color: var(--algo-muted);
  text-decoration: none;
  border-radius: var(--algo-radius-sm);
}
.questions-back:hover {
  color: var(--algo-ink);
  background: var(--algo-soft);
}
h1 {
  min-width: 0;
  font-size: var(--algo-text-heading);
  font-weight: 520;
  letter-spacing: -0.9px;
  line-height: 1.25;
}
.heading-actions {
  display: flex;
  align-items: center;
  gap: var(--algo-space-5);
  flex-shrink: 0;
  margin-left: auto;
}
.problem-details {
  margin-top: var(--algo-space-3);
  margin-left: calc(32px + var(--algo-space-5));
  max-width: 800px;
}
.problem-description {
  font-size: var(--algo-text-body);
  line-height: 1.65;
  color: var(--algo-secondary);
}
.problem-example {
  display: flex;
  align-items: center;
  gap: var(--algo-space-3);
  margin-top: var(--algo-space-3);
  color: var(--algo-muted);
  font-size: var(--algo-text-base);
}
.problem-example code {
  font: inherit;
  font-family: var(--algo-mono);
  color: var(--algo-secondary);
}
.problem-example .example-output {
  color: var(--algo-success);
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { useLessonNavigation } from '../composables/useLessonKeyboard'
import { algorithmQuestions } from '../questions'

const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement | null>(null)
const index = computed(() =>
  algorithmQuestions.findIndex((question) => question.routeName === route.name),
)
const previous = computed(() => algorithmQuestions[index.value - 1])
const next = computed(() => algorithmQuestions[index.value + 1])

useLessonNavigation({
  level: 'questions',
  root,
  count: () => (index.value >= 0 ? algorithmQuestions.length : 0),
  move(move) {
    const target =
      move === 'first' ? 0 : move === 'last' ? algorithmQuestions.length - 1 : index.value + move
    const question = algorithmQuestions[target]
    if (question && target !== index.value) void router.push({ name: question.routeName })
  },
})
</script>

<template>
  <nav v-if="index >= 0" ref="root" class="question-navigation" aria-label="Question navigation">
    <RouterLink
      v-if="previous"
      :to="{ name: previous.routeName }"
      class="question-arrow"
      rel="prev"
      :aria-label="`Previous question: ${previous.title}`"
      aria-keyshortcuts="["
      :title="`Previous: ${previous.title} ([)`"
    >
      <ChevronLeft :size="16" aria-hidden="true" />
    </RouterLink>
    <button
      v-else
      type="button"
      class="question-arrow"
      disabled
      aria-label="Previous question"
      title="First question"
    >
      <ChevronLeft :size="16" aria-hidden="true" />
    </button>

    <span class="question-position algo-mono">
      <span class="algo-sr-only">Question {{ index + 1 }} of {{ algorithmQuestions.length }}</span>
      <span aria-hidden="true">
        <strong>{{ index + 1 }}</strong>
        / {{ algorithmQuestions.length }}
      </span>
    </span>

    <RouterLink
      v-if="next"
      :to="{ name: next.routeName }"
      class="question-arrow"
      rel="next"
      :aria-label="`Next question: ${next.title}`"
      aria-keyshortcuts="]"
      :title="`Next: ${next.title} (])`"
    >
      <ChevronRight :size="16" aria-hidden="true" />
    </RouterLink>
    <button
      v-else
      type="button"
      class="question-arrow"
      disabled
      aria-label="Next question"
      title="Last question"
    >
      <ChevronRight :size="16" aria-hidden="true" />
    </button>
  </nav>
</template>

<style scoped>
.question-navigation {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.question-arrow {
  display: grid;
  place-items: center;
  width: var(--algo-space-8);
  height: var(--algo-space-8);
  padding: 0;
  border: 0;
  border-radius: var(--algo-radius-sm);
  background: transparent;
  color: var(--algo-secondary);
  text-decoration: none;
}
.question-arrow:not(:disabled):hover {
  color: var(--algo-ink);
  background: var(--algo-soft);
}
.question-arrow:disabled {
  color: color-mix(in srgb, var(--algo-muted) 35%, transparent);
}
.question-position {
  min-width: 6ch;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
  text-align: center;
  white-space: nowrap;
}
.question-position strong {
  color: var(--algo-secondary);
  font-weight: 500;
}
</style>

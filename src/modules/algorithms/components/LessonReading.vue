<script setup lang="ts">
import type { LessonDefinition } from '../domain/lesson'
defineProps<{ lesson: Pick<LessonDefinition, 'notes' | 'solutions'> }>()
</script>

<template>
  <section class="lesson-reading" aria-label="Lesson reasoning and Python solutions">
    <details v-if="lesson.notes?.length">
      <summary>Why it works</summary>
      <div class="reading-notes">
        <article v-for="note in lesson.notes" :key="note.title">
          <h3>{{ note.title }}</h3>
          <p>{{ note.text }}</p>
        </article>
      </div>
    </details>
    <details v-for="solution in lesson.solutions" :key="solution.title">
      <summary>Python · {{ solution.title }}</summary>
      <pre
        tabindex="0"
        :aria-label="solution.title + ' Python solution'"
      ><code>{{ solution.code }}</code></pre>
    </details>
  </section>
</template>

<style scoped>
.lesson-reading {
  display: grid;
  gap: var(--algo-space-3);
  margin-top: var(--algo-space-6);
}
details {
  min-width: 0;
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius);
  background: var(--algo-paper);
}
summary {
  padding: var(--algo-space-4) var(--algo-space-5);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
  cursor: pointer;
}
.reading-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--algo-space-6);
  padding: 0 var(--algo-space-5) var(--algo-space-5);
}
h3 {
  font-size: var(--algo-text-body);
  font-weight: 550;
  margin-bottom: var(--algo-space-2);
}
p {
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
  line-height: 1.7;
}
pre {
  max-width: 100%;
  overflow-x: auto;
  margin: 0;
  padding: var(--algo-space-5);
  border-top: 1px solid var(--algo-line);
  color: var(--algo-ink);
  font: var(--algo-text-base)/1.8 var(--algo-mono);
}
code {
  font: inherit;
}
</style>

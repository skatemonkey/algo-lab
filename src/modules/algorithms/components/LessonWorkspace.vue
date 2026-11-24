<script setup lang="ts">
import LessonInspector from './LessonInspector.vue'
import LessonReading from './LessonReading.vue'
import type { LessonDefinition, LessonExecution } from '../domain/lesson'

defineProps<{
  lesson: LessonDefinition
  execution: LessonExecution
  announcement: string
  minimal?: boolean
}>()
</script>

<template>
  <div
    class="lesson-workspace"
    :class="{ minimal, 'with-evaluations': execution.assignments !== undefined }"
  >
    <section class="experiment" aria-label="Interactive visualization">
      <header v-if="$slots.toolbar" class="experiment-toolbar"><slot name="toolbar" /></header>
      <slot name="inputs" />
      <slot name="visualization" />
      <slot name="playback" />
    </section>
    <LessonInspector :lesson="lesson" :execution="execution" :announcement="announcement" />
  </div>
  <footer v-if="lesson.complexity" class="lesson-meta">
    <span>
      Time
      <code>{{ lesson.complexity.time }}</code>
      <span class="meta-separator" aria-hidden="true">·</span>
      <span title="Auxiliary space, excluding the input array">
        Space
        <code>{{ lesson.complexity.space }}</code>
      </span>
    </span>
  </footer>
  <LessonReading
    v-if="!minimal && (lesson.notes?.length || lesson.solutions?.length)"
    :lesson="lesson"
  />
</template>

<style scoped>
.lesson-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--algo-solution-width);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-lg);
  background: var(--algo-paper);
  overflow: hidden;
}
.lesson-workspace.with-evaluations {
  grid-template-columns: minmax(0, 1fr) calc(var(--algo-solution-width) + var(--algo-space-10));
}
.experiment {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.experiment-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-4);
  padding: var(--algo-space-3) var(--algo-space-6);
  border-bottom: 1px solid var(--algo-line);
  color: var(--algo-muted);
  font-size: var(--algo-text-base);
}
.lesson-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--algo-space-4);
  margin-top: var(--algo-space-4);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.lesson-meta code {
  margin-left: var(--algo-space-1);
  font-family: var(--algo-mono);
}
.meta-separator {
  margin-inline: var(--algo-space-3);
}
.minimal .experiment-toolbar {
  display: block;
  padding: 0;
  border: 0;
}
</style>

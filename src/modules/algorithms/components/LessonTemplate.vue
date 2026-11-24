<script setup lang="ts">
import LessonHeader from './LessonHeader.vue'
import LessonShortcutHelp from './LessonShortcutHelp.vue'
import LessonWorkspace from './LessonWorkspace.vue'
import type { LessonDefinition, LessonExecution } from '../domain/lesson'

defineProps<{
  lesson: LessonDefinition
  execution: LessonExecution
  announcement: string
}>()
</script>

<template>
  <main class="algorithm-lesson">
    <LessonHeader :problem="lesson.problem">
      <slot name="actions" />
      <LessonShortcutHelp />
    </LessonHeader>
    <slot>
      <slot name="settings" />
      <LessonWorkspace :lesson="lesson" :execution="execution" :announcement="announcement">
        <template #visualization><slot name="visualization" /></template>
        <template #playback><slot name="playback" /></template>
      </LessonWorkspace>
    </slot>
  </main>
</template>

<style scoped>
.algorithm-lesson {
  max-width: var(--algo-workspace-width);
  margin: 0 auto;
  padding: var(--algo-space-12);
}
</style>

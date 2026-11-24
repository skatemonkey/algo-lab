<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, ArrowUpRight } from '@lucide/vue'
import AlgoButton from '../components/AlgoButton.vue'
import BoundaryVisualization from '../components/BoundaryVisualization.vue'
import LessonInspector from '../components/LessonInspector.vue'
import LessonShortcutHelp from '../components/LessonShortcutHelp.vue'
import PlaybackControls from '../components/PlaybackControls.vue'
import { usePlayback } from '../composables/usePlayback'
import { useLessonPlayback } from '../composables/useLessonKeyboard'
import { traceBinarySearchPattern, type SearchDirection } from '../domain/binarySearchPattern'
import { algorithmQuestions } from '../questions'
import { binarySearchPattern as pattern } from '../patterns/binarySearch'

const questions = algorithmQuestions.filter((question) => question.patternId === pattern.id)
const values = [3, 7, 11, 16, 22, 29, 35, 41, 48, 56, 64, 73]
const directions = ref<SearchDirection[]>([])
const frames = computed(() => traceBinarySearchPattern(values.length, directions.value))
const { cursor, playing, speed, last, frame, reset, seek, toggle, previous, next } =
  usePlayback(frames)
const checking = computed(() => frame.value.instruction === 'check')
const waiting = computed(() => checking.value && cursor.value === last.value)
const completed = computed(() => frame.value.instruction === 'return')
const announcement = computed(
  () =>
    `Left ${frame.value.left}, right ${frame.value.right}, mid ${frame.value.mid ?? 'not set'}.${waiting.value ? ' Choose left, right, or stop.' : ''}`,
)
const choices = [
  { direction: 'left', label: 'Keep left' },
  { direction: 'right', label: 'Keep right' },
  { direction: 'stop', label: 'Stop' },
] as const

function choose(direction: SearchDirection) {
  if (!checking.value) return
  const position = cursor.value
  directions.value = [...directions.value.slice(0, frame.value.round), direction]
  seek(position + 1)
}
function restart() {
  directions.value = []
  reset()
}
function togglePlayback() {
  if (!waiting.value) toggle()
}
useLessonPlayback({ toggle: togglePlayback, next, previous })
</script>

<template>
  <main class="pattern-page">
    <header class="pattern-heading">
      <div class="heading-row">
        <RouterLink
          :to="{ name: 'algorithms' }"
          class="back-link"
          aria-label="Back to algorithms"
          title="Back to algorithms"
        >
          <ArrowLeft :size="19" aria-hidden="true" />
        </RouterLink>
        <h1>{{ pattern.title }}</h1>
        <span class="pattern-label">Pattern</span>
        <LessonShortcutHelp />
      </div>
      <p>Explore the range. Choose which half to keep at each check.</p>
    </header>

    <section class="pattern-workspace" aria-label="Binary search pattern">
      <div class="pattern-demo">
        <BoundaryVisualization
          :values="values"
          :frame="frame"
          :show-answer="false"
          array-label="Search array"
        />
        <div class="direction-controls" role="group" aria-label="Choose search direction">
          <span class="direction-hint" role="status">
            {{
              checking
                ? 'Choose the next move'
                : completed
                  ? frame.left > frame.right
                    ? 'Range empty'
                    : 'Search stopped'
                  : 'Choose at the check step'
            }}
          </span>
          <div class="direction-buttons">
            <AlgoButton
              v-for="choice in choices"
              :key="choice.direction"
              :disabled="!checking"
              :variant="checking ? 'secondary' : 'quiet'"
              @click="choose(choice.direction)"
            >
              {{ choice.label }}
            </AlgoButton>
          </div>
        </div>
        <PlaybackControls
          :cursor="cursor"
          :last="last"
          :playing="playing"
          :waiting="waiting"
          :show-total="false"
          v-model:speed="speed"
          @toggle="togglePlayback"
          @previous="previous"
          @next="next"
          @reset="restart"
          @seek="seek"
        />
      </div>

      <LessonInspector
        :lesson="pattern"
        :execution="frame"
        :announcement="announcement"
        title="General pattern"
      />
    </section>

    <footer class="pattern-footer">
      <span class="algo-mono">O(log n) checks</span>
      <nav aria-label="Related questions">
        <RouterLink
          v-for="question in questions"
          :key="question.id"
          :to="{ name: question.routeName }"
          :aria-label="`Open ${question.title}`"
        >
          {{ question.title }}
          <ArrowUpRight :size="13" aria-hidden="true" />
        </RouterLink>
      </nav>
    </footer>
  </main>
</template>

<style scoped>
.pattern-page {
  max-width: var(--algo-workspace-width);
  margin: 0 auto;
  padding: var(--algo-space-12);
}
.pattern-heading {
  margin-bottom: var(--algo-space-8);
}
.heading-row {
  display: flex;
  align-items: center;
  gap: var(--algo-space-5);
}
.back-link {
  display: grid;
  place-items: center;
  width: var(--algo-space-8);
  height: 36px;
  color: var(--algo-muted);
  border-radius: var(--algo-radius-sm);
}
.back-link:hover {
  color: var(--algo-ink);
  background: var(--algo-soft);
}
h1 {
  font-size: var(--algo-text-heading);
  font-weight: 520;
  line-height: 1.25;
  letter-spacing: -0.9px;
}
.pattern-label {
  margin-left: auto;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.pattern-heading p {
  margin-top: var(--algo-space-3);
  margin-left: calc(var(--algo-space-8) + var(--algo-space-5));
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
}
.pattern-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--algo-solution-width);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-lg);
  background: var(--algo-paper);
  overflow: hidden;
}
.pattern-demo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.direction-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-3);
  padding: var(--algo-space-3) var(--algo-space-8) var(--algo-space-5);
}
.direction-hint {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.direction-buttons {
  display: flex;
  gap: var(--algo-space-2);
}
.pattern-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-5);
  margin-top: var(--algo-space-5);
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.pattern-footer nav {
  display: flex;
  gap: var(--algo-space-5);
}
.pattern-footer a {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-1);
  color: inherit;
  text-decoration: none;
}
.pattern-footer a:hover {
  color: var(--algo-accent);
}
</style>

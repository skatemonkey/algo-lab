<script setup lang="ts" generic="Frame extends LessonExecution">
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue'
import LessonArrayToolbar from './LessonArrayToolbar.vue'
import LessonInputPanel from './LessonInputPanel.vue'
import LessonTemplate from './LessonTemplate.vue'
import LessonWorkspace from './LessonWorkspace.vue'
import LessonWalkthrough from './LessonWalkthrough.vue'
import PlaybackControls from './PlaybackControls.vue'
import { usePlayback } from '../composables/usePlayback'
import { useLessonPlayback } from '../composables/useLessonKeyboard'
import type {
  ExecutionValue,
  ExecutionVariable,
  LessonDefinition,
  LessonExecution,
  LessonFact,
} from '../domain/lesson'

const props = defineProps<{
  lesson: LessonDefinition
  frames: readonly Frame[]
  length?: number
  facts?: readonly LessonFact[]
  presets: readonly string[]
  selectedPreset: string
  error: string
  dirty: boolean
  applyInput: () => boolean
  variablesFor: (frame: Frame) => readonly ExecutionVariable[]
  resultFor?: (frame: Frame) => ExecutionValue | null
}>()
const emit = defineEmits<{ edit: []; preset: [index: number] }>()
const slots = useSlots()
const sections = [
  ...(slots.approach ? [{ id: 'approach', label: 'Approach' }] : []),
  ...(slots.reasoning ? [{ id: 'reasoning', label: 'Reasoning' }] : []),
  { id: 'solution', label: 'Solution' },
]
const section = ref(sections[0]!.id)
const frames = computed(() => props.frames)
const { cursor, playing, speed, last, frame, reset, seek, toggle, previous, next, pause } =
  usePlayback(frames)
const editorOpen = ref(false)
const toolbar = ref<InstanceType<typeof LessonArrayToolbar> | null>(null)
const inputFields = ref<HTMLElement | null>(null)
const editorId = useId()
const variables = computed(() => props.variablesFor(frame.value))
const execution = computed(() => ({
  ...frame.value,
  assignments:
    frame.value.assignments ??
    variables.value.flatMap((variable) =>
      variable.updated && variable.value !== null
        ? [{ name: variable.name, value: variable.value }]
        : [],
    ),
}))
const announcement = computed(() =>
  variables.value
    .filter((variable) => variable.value !== null)
    .map((variable) => `${variable.name} ${variable.value}`)
    .join(', '),
)
const result = computed(() => props.resultFor?.(frame.value) ?? null)

useLessonPlayback({
  toggle,
  next,
  previous,
  enabled: () => section.value === 'solution' && !editorOpen.value,
})
watch(
  section,
  () => {
    pause()
    editorOpen.value = false
    emit('edit')
  },
  { flush: 'sync' },
)

function focusInput() {
  inputFields.value?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus()
}
function closeEditor() {
  emit('edit')
  editorOpen.value = false
  void nextTick(() => toolbar.value?.focus())
}
function toggleEditor() {
  if (editorOpen.value) return closeEditor()
  pause()
  emit('edit')
  editorOpen.value = true
}
function selectPreset(index: number) {
  emit('preset', index)
  reset()
}
function apply() {
  if (!props.dirty) return
  if (props.applyInput()) reset()
  void nextTick(focusInput)
}
</script>

<template>
  <LessonTemplate :lesson="lesson" :execution="execution" :announcement="announcement">
    <slot name="options" :section="section" />
    <LessonWalkthrough v-model="section" :stages="sections" variant="sections">
      <template #default="{ stage }">
        <slot v-if="stage !== 'solution'" :name="stage" :active="section === stage" />
        <LessonWorkspace
          v-else
          minimal
          :lesson="lesson"
          :execution="execution"
          :announcement="announcement"
        >
          <template #toolbar>
            <LessonArrayToolbar
              ref="toolbar"
              :variables="variables"
              :length="length"
              :facts="facts"
              :expanded="editorOpen"
              :editor-id="editorId"
              @toggle="toggleEditor"
              @cancel="closeEditor"
              @ready="focusInput"
            >
              <div ref="inputFields">
                <LessonInputPanel
                  compact
                  :presets="presets"
                  :selected-preset="selectedPreset"
                  :error="error"
                  :dirty="dirty"
                  @apply="apply"
                  @preset="selectPreset"
                  @cancel="closeEditor"
                >
                  <template #default="{ errorId }">
                    <slot name="inputs" :error-id="errorId" />
                  </template>
                </LessonInputPanel>
              </div>
            </LessonArrayToolbar>
          </template>
          <template #visualization>
            <slot
              name="visualization"
              :frame="frame"
              :previous-frame="frames[cursor - 1] ?? null"
              :pause="pause"
              :editing="editorOpen"
              :active="section === 'solution'"
            />
          </template>
          <template #playback>
            <PlaybackControls
              compact
              :disabled="editorOpen"
              :cursor="cursor"
              :last="last"
              :playing="playing"
              v-model:speed="speed"
              @toggle="toggle"
              @previous="previous"
              @next="next"
              @reset="reset"
              @seek="seek"
            />
            <div class="question-result algo-mono" role="status">
              <slot v-if="frame.instruction === 'return'" name="result" :frame="frame">
                <span v-if="result !== null" data-testid="search-result">return {{ result }}</span>
              </slot>
            </div>
          </template>
        </LessonWorkspace>
      </template>
    </LessonWalkthrough>
  </LessonTemplate>
</template>

<style scoped>
.question-result {
  min-height: 34px;
  padding: 0 var(--algo-space-6) var(--algo-space-3);
  text-align: center;
  color: var(--algo-success);
  font-size: var(--algo-text-base);
}
</style>

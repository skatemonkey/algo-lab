<script setup lang="ts" generic="Frame extends LessonExecution">
import { computed, ref } from 'vue'
import QuestionWorkspace from './QuestionWorkspace.vue'
import ArrayInputField from './ArrayInputField.vue'
import { useInputPresets } from '../composables/useInputPresets'
import type {
  ExecutionValue,
  ExecutionVariable,
  LessonDefinition,
  LessonExecution,
} from '../domain/lesson'
const props = withDefaults(
  defineProps<{
    lesson: LessonDefinition
    presets: readonly { label: string; values: readonly number[] }[]
    inputLabel: string
    limit?: number
    parseInput: (text: string) => number[]
    trace: (values: readonly number[]) => readonly Frame[]
    variablesFor: (frame: Frame) => readonly ExecutionVariable[]
    resultFor?: (frame: Frame) => ExecutionValue | null
  }>(),
  { limit: 16 },
)
const {
  input: values,
  activePreset,
  apply: commitInput,
  select,
  restore,
} = useInputPresets(
  [...props.presets[0]!.values],
  props.presets.map((preset) => [...preset.values]),
  (values) => [...values],
)
const draft = ref(values.value.join(', '))
const error = ref('')
const frames = computed(() => props.trace(values.value))
const dirty = computed(() => draft.value.trim() !== values.value.join(', '))
const selectedPreset = computed(() => {
  if (dirty.value) return 'custom'
  const index = props.presets.findIndex(
    (preset) => preset.values.join(',') === values.value.join(','),
  )
  return index < 0 ? 'custom' : String(index)
})
function syncDraft() {
  draft.value = values.value.join(', ')
  error.value = ''
}
function selectPreset(index: number) {
  if (!props.presets[index]) return
  select(index)
  syncDraft()
}
function restoreInput() {
  restore()
  syncDraft()
}
function updateDraft(value: string) {
  draft.value = value
  error.value = ''
}
function applyInput() {
  try {
    const parsed = props.parseInput(draft.value)
    if (parsed.length > props.limit)
      throw new RangeError(`Use up to ${props.limit} values for this visualization.`)
    commitInput(parsed)
    syncDraft()
    return true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Check the input.'
    return false
  }
}
</script>
<template>
  <QuestionWorkspace
    :lesson="lesson"
    :frames="frames"
    :length="values.length"
    :presets="presets.map((preset) => preset.label)"
    :selected-preset="selectedPreset"
    :error="error"
    :dirty="dirty"
    :apply-input="applyInput"
    :variables-for="variablesFor"
    :result-for="resultFor"
    @edit="syncDraft"
    @preset="selectPreset"
  >
    <template v-if="$slots.approach" #approach="{ active }">
      <slot
        name="approach"
        :active="active"
        :values="values"
        :frames="frames"
        :presets="presets.map((preset) => preset.label)"
        :selected-preset="activePreset"
        :draft="draft"
        :error="error"
        :dirty="dirty"
        :apply-input="applyInput"
        :sync-draft="syncDraft"
        :select-preset="selectPreset"
        :restore-input="restoreInput"
        :update-draft="updateDraft"
      />
    </template>
    <template #inputs="{ errorId }">
      <ArrayInputField
        v-model="draft"
        :label="inputLabel"
        :error="error"
        :error-id="errorId"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, previousFrame, pause, editing, active }">
      <slot
        name="visualization"
        :frame="frame"
        :previous-frame="previousFrame"
        :pause="pause"
        :values="values"
        :editing="editing"
        :active="active"
      />
    </template>
    <template v-if="$slots.result" #result="{ frame }">
      <slot name="result" :frame="frame" />
    </template>
  </QuestionWorkspace>
</template>

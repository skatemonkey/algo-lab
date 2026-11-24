<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  searchVariables,
  type BoundarySearchApproach as ApproachDefinition,
} from '../domain/searchPresentation'
import BoundarySearchApproach from './BoundarySearchApproach.vue'
import BoundarySearchVisualization from './BoundarySearchVisualization.vue'
import IntegerSearchInputFields from './IntegerSearchInputFields.vue'
import QuestionWorkspace from './QuestionWorkspace.vue'
import { useInputPresets } from '../composables/useInputPresets'
import {
  parseIntegerSearchInput,
  traceFirstOccurrence,
  traceFirstNotSmaller,
  type IntegerSearchMode,
  type IntegerSearchPreset,
} from '../domain/integerSearch'
import type { LessonDefinition } from '../domain/lesson'

const props = defineProps<{
  lesson: LessonDefinition
  approach: ApproachDefinition
  presets: readonly IntegerSearchPreset[]
  mode: IntegerSearchMode
}>()
const initial = props.presets[0]!
const exact = props.mode === 'exact'
const trace = exact ? traceFirstOccurrence : traceFirstNotSmaller
const {
  input,
  activePreset: approachPreset,
  apply: commitInput,
  select,
  restore,
} = useInputPresets(
  { values: [...initial.values], target: initial.target },
  props.presets.map(({ values, target }) => ({ values: [...values], target })),
  (value) => ({ values: [...value.values], target: value.target }),
)
const draftArray = ref(input.value.values.join(', '))
const draftTarget = ref(String(input.value.target))
const error = ref('')
const presetLabels = computed(() => props.presets.map((preset) => preset.label))
const frames = computed(() => trace(input.value.values, input.value.target))
const boundary = computed(() => {
  const index = input.value.values.findIndex((value) => value >= input.value.target)
  return index < 0 ? input.value.values.length : index
})
const answer = computed(() => input.value.values.findIndex((_, index) => canSave(index)))
const division = computed(() => ({
  index: boundary.value,
  before: props.approach.cases[0].condition,
  after: props.approach.cases[1].condition,
}))
const dirty = computed(
  () =>
    draftArray.value.trim() !== input.value.values.join(', ') ||
    draftTarget.value.trim() !== String(input.value.target),
)
const selectedPreset = computed(() => {
  if (dirty.value) return 'custom'
  const index = props.presets.findIndex(
    (preset) =>
      preset.target === input.value.target &&
      preset.values.join(',') === input.value.values.join(','),
  )
  return index < 0 ? 'custom' : String(index)
})
function canSave(index: number) {
  const value = input.value.values[index]!
  return exact ? value === input.value.target : value >= input.value.target
}
function syncDraft() {
  draftArray.value = input.value.values.join(', ')
  draftTarget.value = String(input.value.target)
  error.value = ''
}
function selectPreset(index: number) {
  select(index)
  syncDraft()
}
function restoreCurrentInput() {
  restore()
  syncDraft()
}
function applyInput() {
  try {
    const parsed = parseIntegerSearchInput(draftArray.value, draftTarget.value)
    if (parsed.values.length > 16)
      throw new RangeError('Use up to 16 values for this visualization.')
    trace(parsed.values, parsed.target)
    commitInput(parsed)
    syncDraft()
    return true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Check the array and target.'
    return false
  }
}
</script>

<template>
  <QuestionWorkspace
    class="integer-search-lesson"
    :lesson="lesson"
    :frames="frames"
    :length="input.values.length"
    :facts="[{ id: 'target-value', label: 'target', value: input.target }]"
    :presets="presetLabels"
    :selected-preset="selectedPreset"
    :error="error"
    :dirty="dirty"
    :apply-input="applyInput"
    :variables-for="searchVariables"
    :result-for="(frame) => frame.answer"
    @edit="syncDraft"
    @preset="selectPreset"
  >
    <template #approach="{ active }">
      <BoundarySearchApproach
        :approach="approach"
        :label="lesson.problem.title"
        :values="input.values"
        :boundary="boundary"
        :answer="answer"
        :can-save="canSave"
        :facts="[{ id: 'approach-target', label: 'target', value: input.target }]"
        :presets="presetLabels"
        :selected-preset="approachPreset"
        :active="active"
        :error="error"
        :dirty="dirty"
        :apply-input="applyInput"
        @edit="syncDraft"
        @preset="selectPreset"
        @restore="restoreCurrentInput"
      >
        <template #inputs="{ errorId }">
          <IntegerSearchInputFields
            v-model:array="draftArray"
            v-model:target="draftTarget"
            :error="error"
            :error-id="errorId"
            @clear-error="error = ''"
          />
        </template>
      </BoundarySearchApproach>
    </template>
    <template #inputs="{ errorId }">
      <IntegerSearchInputFields
        v-model:array="draftArray"
        v-model:target="draftTarget"
        :error="error"
        :error-id="errorId"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, editing }">
      <BoundarySearchVisualization
        :values="input.values"
        :target="input.target"
        :frame="frame"
        :division="division"
        :cases="approach.cases"
        :exact="exact"
        :editing="editing"
      />
    </template>
  </QuestionWorkspace>
</template>

<style scoped>
.integer-search-lesson :deep(.compact .preset-field) {
  flex-basis: 11rem;
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { searchVariables } from '../domain/searchPresentation'
import BoundarySearchVisualization from '../components/BoundarySearchVisualization.vue'
import QuestionWorkspace from '../components/QuestionWorkspace.vue'
import ArrayInputField from '../components/ArrayInputField.vue'
import BoundarySearchApproach from '../components/BoundarySearchApproach.vue'
import ArrayProfileBackdrop from '../components/ArrayProfileBackdrop.vue'
import RotatedMinimumReasoning from '../components/RotatedMinimumReasoning.vue'
import { useInputPresets } from '../composables/useInputPresets'
import { parseRotatedMinimumInput, traceRotatedMinimum } from '../domain/rotatedMinimum'
import {
  rotatedMinimumPresets as presets,
  rotatedMinimumApproach as approach,
  rotatedMinimumLesson as lesson,
} from '../lessons/rotatedMinimum'

const {
  input: values,
  activePreset: approachPreset,
  apply: commitInput,
  select,
  restore,
} = useInputPresets<number[]>(
  [...presets[0].values],
  presets.map((preset) => [...preset.values]),
  (input) => [...input],
)
const presetLabels = presets.map((preset) => preset.label)
const fixedLast = computed(() => values.value[values.value.length - 1]!)
const boundary = computed(() => values.value.findIndex((value) => value <= fixedLast.value))
const division = computed(() => ({
  index: boundary.value,
  before: approach.regions[0],
  after: approach.regions[1],
}))
function comparisonFor(index: number) {
  return `${values.value[index]} ${index >= boundary.value ? '≤' : '>'} ${fixedLast.value}`
}
const frames = computed(() => traceRotatedMinimum(values.value))
const draftArray = ref(values.value.join(', '))
const error = ref('')
const dirty = computed(() => draftArray.value.trim() !== values.value.join(', '))
const selectedPreset = computed(() => {
  if (dirty.value) return 'custom'
  const index = presets.findIndex((preset) => preset.values.join(',') === values.value.join(','))
  return index < 0 ? 'custom' : String(index)
})
function syncDraft() {
  draftArray.value = values.value.join(', ')
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
    const parsed = parseRotatedMinimumInput(draftArray.value)
    if (parsed.length > 16) throw new RangeError('Use up to 16 values for this visualization.')
    commitInput(parsed)
    syncDraft()
    return true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Check the array.'
    return false
  }
}
</script>

<template>
  <QuestionWorkspace
    class="rotated-minimum-lesson"
    :lesson="lesson"
    :frames="frames"
    :length="values.length"
    :facts="[
      { id: 'fixed-last', label: 'A[−1]', value: fixedLast, description: 'Fixed last element' },
    ]"
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
        label="Find the minimum in a rotated array"
        :values="values"
        :boundary="boundary"
        :answer="boundary"
        :can-save="(index) => index >= boundary"
        :compare-to="() => values.length - 1"
        comparison-label="last"
        :comparison-for="comparisonFor"
        :facts="[
          {
            id: 'approach-fixed-last',
            label: 'A[−1]',
            value: fixedLast,
            description: 'Fixed last element',
          },
        ]"
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
        <template #backdrop="{ range }">
          <ArrayProfileBackdrop
            :values="values"
            :left="range?.left"
            :right="range?.right"
            label="Rotated array profile behind the array"
          />
        </template>
        <template #inputs="{ errorId }">
          <ArrayInputField
            v-model="draftArray"
            label="Rotated array"
            placeholder="30, 40, 50, 10, 20"
            :error="error"
            :error-id="errorId"
            @clear-error="error = ''"
          />
        </template>
      </BoundarySearchApproach>
    </template>
    <template #reasoning>
      <RotatedMinimumReasoning />
    </template>
    <template #inputs="{ errorId }">
      <ArrayInputField
        v-model="draftArray"
        label="Rotated array"
        placeholder="30, 40, 50, 10, 20"
        :error="error"
        :error-id="errorId"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, editing }">
      <BoundarySearchVisualization
        :division="division"
        :cases="approach.cases"
        :editing="editing"
        :values="values"
        :frame="frame"
        array-label="Rotated integer array"
      >
        <template #backdrop>
          <ArrayProfileBackdrop
            :values="values"
            :left="frame.left"
            :right="frame.right"
            label="Rotated array profile behind the array"
          />
        </template>
      </BoundarySearchVisualization>
    </template>
  </QuestionWorkspace>
</template>

<style scoped>
.rotated-minimum-lesson :deep(.compact .preset-field) {
  flex-basis: 11rem;
}
</style>

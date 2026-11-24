<script setup lang="ts">
import { computed, ref } from 'vue'
import { searchVariables } from '../domain/searchPresentation'
import BoundarySearchApproach from '../components/BoundarySearchApproach.vue'
import BoundarySearchVisualization from '../components/BoundarySearchVisualization.vue'
import FirstTrueInputFields from '../components/FirstTrueInputFields.vue'
import QuestionWorkspace from '../components/QuestionWorkspace.vue'
import { useInputPresets } from '../composables/useInputPresets'
import { boundaryArray, traceFirstTrue } from '../domain/binarySearch'
import { firstTrueApproach, firstTrueLesson } from '../lessons/firstTrue'

const presets = [
  { label: 'Example', length: 5, boundary: 2 },
  { label: 'All false', length: 12, boundary: 12 },
  { label: 'All true', length: 12, boundary: 0 },
  { label: 'Empty', length: 0, boundary: 0 },
]
const {
  input,
  activePreset: approachPreset,
  apply: commitInput,
  select,
  restore,
} = useInputPresets<{ length: number; boundary: number }>(
  { length: 12, boundary: 7 },
  presets,
  (value) => ({
    length: value.length,
    boundary: value.boundary,
  }),
)
const draftLength = ref(String(input.value.length))
const error = ref('')
const values = computed(() => boundaryArray(input.value.length, input.value.boundary))
const frames = computed(() => traceFirstTrue(values.value))
const division = computed(() => ({
  index: input.value.boundary,
  before: firstTrueApproach.cases[0].condition,
  after: firstTrueApproach.cases[1].condition,
}))
const dirty = computed(() => String(draftLength.value).trim() !== String(input.value.length))
const selectedPreset = computed(() => {
  if (dirty.value) return 'custom'
  const index = presets.findIndex(
    (preset) => preset.length === input.value.length && preset.boundary === input.value.boundary,
  )
  return index < 0 ? 'custom' : String(index)
})
function syncDraft() {
  draftLength.value = String(input.value.length)
  error.value = ''
}
function restoreCurrentInput() {
  restore()
  syncDraft()
}
function selectPreset(index: number) {
  select(index)
  syncDraft()
}
function updateBoundary(boundary: number) {
  commitInput({ ...input.value, boundary })
}
function applyInput() {
  const rawLength = String(draftLength.value).trim()
  const length = Number(rawLength)
  if (!rawLength || !Number.isInteger(length) || length < 0 || length > 16) {
    error.value = 'Choose a length from 0 through 16.'
    return false
  }
  commitInput({ length, boundary: Math.min(input.value.boundary, length) })
  syncDraft()
  return true
}
</script>

<template>
  <QuestionWorkspace
    :lesson="firstTrueLesson"
    :frames="frames"
    :length="values.length"
    :presets="presets.map((preset) => preset.label)"
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
        :approach="firstTrueApproach"
        :label="firstTrueLesson.problem.title"
        :boundary="input.boundary"
        :answer="values.findIndex(Boolean)"
        :can-save="(index) => values[index] === true"
        :values="values"
        :presets="presets.map((preset) => preset.label)"
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
          <FirstTrueInputFields
            v-model="draftLength"
            :length="input.length"
            :boundary="input.boundary"
            :error="error"
            :error-id="errorId"
            @boundary="updateBoundary"
            @clear-error="error = ''"
          />
        </template>
      </BoundarySearchApproach>
    </template>
    <template #inputs="{ errorId }">
      <FirstTrueInputFields
        v-model="draftLength"
        :length="input.length"
        :boundary="input.boundary"
        :error="error"
        :error-id="errorId"
        @boundary="updateBoundary"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, editing }">
      <BoundarySearchVisualization
        :values="values"
        :frame="frame"
        :division="division"
        :cases="firstTrueApproach.cases"
        :editing="editing"
      />
    </template>
  </QuestionWorkspace>
</template>

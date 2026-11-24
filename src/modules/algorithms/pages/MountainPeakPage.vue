<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LessonComparison from '../components/LessonComparison.vue'
import LessonWalkthrough from '../components/LessonWalkthrough.vue'
import MidpointCalculation from '../components/MidpointCalculation.vue'
import MountainPeakReasoning from '../components/MountainPeakReasoning.vue'
import MountainPeakVisualization from '../components/MountainPeakVisualization.vue'
import QuestionWorkspace from '../components/QuestionWorkspace.vue'
import ArrayInputField from '../components/ArrayInputField.vue'
import BoundarySearchApproach from '../components/BoundarySearchApproach.vue'
import { useInputPresets } from '../composables/useInputPresets'
import { parseMountainPeakInput, traceMountainPeak } from '../domain/mountainPeak'
import { searchVariables } from '../domain/searchPresentation'
import {
  mountainPeakPresets as presets,
  mountainPeakApproach as approach,
  mountainPeakLesson,
} from '../lessons/mountainPeak'
import {
  mountainPeakReasoningStages,
  midpointRuleExample,
  leftNeighborFailure,
  rightNeighborSolution,
} from '../lessons/mountainPeakWalkthrough'

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
const stage = ref('midpoint')
const pairStart = ref<number>(midpointRuleExample.left)
const endpoint = ref<'first' | 'last'>('first')
const endpointIndex = computed(() => (endpoint.value === 'first' ? 0 : values.value.length - 2))
const endpointComparison = computed(
  () =>
    `${values.value[endpointIndex.value]} ${endpoint.value === 'first' ? '<' : '>'} ${values.value[endpointIndex.value + 1]}`,
)
watch(values, () => {
  pairStart.value = midpointRuleExample.left
  endpoint.value = 'first'
})
const boundary = computed(() =>
  values.value.findIndex((value, index) => value > values.value[index + 1]!),
)
function comparisonFor(index: number) {
  return `${values.value[index]} ${index >= boundary.value ? '>' : '<'} ${values.value[index + 1]}`
}
const frames = computed(() => traceMountainPeak(values.value))
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
    const parsed = parseMountainPeakInput(draftArray.value)
    if (parsed.length > 16) throw new RangeError('Use up to 16 values for this visualization.')
    commitInput(parsed)
    syncDraft()
    return true
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Check the mountain array.'
    return false
  }
}
</script>

<template>
  <QuestionWorkspace
    class="mountain-peak-lesson"
    :lesson="mountainPeakLesson"
    :frames="frames"
    :length="values.length"
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
        label="The peak of a mountain array"
        :values="values"
        :boundary="boundary"
        :answer="boundary"
        :can-save="(index) => index >= boundary"
        :compare-to="(index) => index + 1"
        comparison-label="mid + 1"
        :comparison-for="comparisonFor"
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
          <ArrayInputField
            v-model="draftArray"
            label="Mountain array"
            placeholder="0, 1, 2, 3, 2, 1, 0"
            :error="error"
            :error-id="errorId"
            @clear-error="error = ''"
          />
        </template>
      </BoundarySearchApproach>
    </template>
    <template #reasoning>
      <LessonWalkthrough
        v-model="stage"
        :stages="mountainPeakReasoningStages"
        label="Reasoning"
        :show-label="false"
      >
        <template #actions="{ stage }">
          <MidpointCalculation
            v-if="stage === 'midpoint'"
            :left="pairStart"
            :right="pairStart + 1"
          />
          <LessonComparison
            v-else-if="stage === 'endpoints'"
            data-testid="endpoint-comparison"
            :formula="endpoint === 'first' ? 'A[0] < A[1]' : 'A[n − 2] > A[n − 1]'"
            :comparison="endpointComparison"
            :result="endpoint === 'first' ? 'Rising' : 'Falling'"
            :direction="endpoint === 'first' ? 'rising' : 'falling'"
          />
          <LessonComparison
            v-else-if="stage === 'left-neighbor'"
            data-testid="left-neighbor-comparison"
            v-bind="leftNeighborFailure.comparison"
          />
          <LessonComparison
            v-else-if="stage === 'right-neighbor'"
            data-testid="right-neighbor-comparison"
            v-bind="rightNeighborSolution.comparison"
          />
        </template>
        <template #default="{ stage }">
          <MountainPeakReasoning
            v-model:pair-start="pairStart"
            v-model:endpoint="endpoint"
            :stage="stage"
            :values="values"
          />
        </template>
      </LessonWalkthrough>
    </template>
    <template #inputs="{ errorId }">
      <ArrayInputField
        v-model="draftArray"
        label="Mountain array"
        placeholder="0, 1, 2, 3, 2, 1, 0"
        :error="error"
        :error-id="errorId"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, editing }">
      <MountainPeakVisualization
        :values="values"
        :frame="frame"
        :editing="editing"
        :boundary="boundary"
      />
    </template>
  </QuestionWorkspace>
</template>

<style scoped>
.mountain-peak-lesson :deep(.boundary-approach) {
  --approach-columns: minmax(0, 1fr) minmax(30rem, 1.6fr) minmax(12rem, 0.8fr);
}
.mountain-peak-lesson :deep(.compact .preset-field) {
  flex-basis: 11rem;
}
</style>

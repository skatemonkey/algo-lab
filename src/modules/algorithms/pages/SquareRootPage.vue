<script setup lang="ts">
import { computed, ref } from 'vue'
import SquareRootApproachView from '../components/SquareRootApproach.vue'
import SquareRootInputFields from '../components/SquareRootInputFields.vue'
import SquareRootReasoning from '../components/SquareRootReasoning.vue'
import { useInputPresets } from '../composables/useInputPresets'
import QuestionWorkspace from '../components/QuestionWorkspace.vue'
import SquareRootVisualization from '../components/SquareRootVisualization.vue'
import {
  parseSquareRootInput,
  traceSquareRoot,
  type SquareRootApproach,
  type SquareRootFrame,
} from '../domain/squareRoot'
import { searchVariables } from '../domain/searchPresentation'
import {
  squareRootApproaches,
  squareRootExamples,
  squareRootLessons,
  squareRootPresets,
} from '../lessons/squareRoot'

const presets = squareRootPresets
const {
  input: n,
  activePreset: approachPreset,
  apply: commitInput,
  select,
  restore,
} = useInputPresets<number>(
  squareRootExamples[0].n,
  presets.map((preset) => preset.n),
  (value) => value,
)
const approach = ref<SquareRootApproach>('lower')
const approaches = [
  { id: 'lower', label: 'Lower boundary' },
  { id: 'upper', label: 'Upper boundary' },
] as const
const lesson = computed(() => squareRootLessons[approach.value])
const frames = computed(() => traceSquareRoot(n.value, approach.value))
const finalFrame = computed(() => frames.value[frames.value.length - 1]!)
const presetLabels = presets.map((preset) => preset.label)
const draftN = ref(String(n.value))
const error = ref('')
const dirty = computed(() => draftN.value.trim() !== String(n.value))
const selectedPreset = computed(() => {
  if (dirty.value) return 'custom'
  const index = presets.findIndex((preset) => preset.n === n.value)
  return index < 0 ? 'custom' : String(index)
})
function variablesFor(frame: SquareRootFrame) {
  const upper = approach.value === 'upper'
  return [
    ...searchVariables(frame, upper ? 'boundary' : 'answer'),
    { name: 'square', value: frame.square, updated: frame.instruction === 'square' },
    ...(upper
      ? [
          {
            name: 'answer',
            value: frame.result,
            updated: ['result', 'adjust'].includes(frame.instruction),
          },
        ]
      : []),
  ]
}
function syncDraft() {
  draftN.value = String(n.value)
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
    commitInput(parseSquareRootInput(draftN.value))
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
    :facts="[{ id: 'root-input', label: 'n', value: n, description: 'Input n' }]"
    :presets="presetLabels"
    :selected-preset="selectedPreset"
    :error="error"
    :dirty="dirty"
    :apply-input="applyInput"
    :variables-for="variablesFor"
    :result-for="(frame) => frame.result"
    @edit="syncDraft"
    @preset="selectPreset"
  >
    <template #options="{ section }">
      <div
        v-if="section !== 'reasoning'"
        class="approach-options"
        role="group"
        aria-label="Square root variation"
      >
        <span class="variation-label">Variation</span>
        <div class="variation-switch">
          <button
            type="button"
            v-for="option in approaches"
            :key="option.id"
            :aria-pressed="approach === option.id"
            @click="approach = option.id"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </template>
    <template #approach="{ active }">
      <SquareRootApproachView
        :n="n"
        :variant="approach"
        :boundary="finalFrame.answer ?? 0"
        :result="finalFrame.result ?? 0"
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
          <SquareRootInputFields
            v-model="draftN"
            :error="error"
            :error-id="errorId"
            @clear-error="error = ''"
          />
        </template>
      </SquareRootApproachView>
    </template>
    <template #reasoning>
      <SquareRootReasoning />
    </template>
    <template #inputs="{ errorId }">
      <SquareRootInputFields
        v-model="draftN"
        :error="error"
        :error-id="errorId"
        @clear-error="error = ''"
      />
    </template>
    <template #visualization="{ frame, editing }">
      <SquareRootVisualization
        :n="n"
        :approach="approach"
        :boundary="finalFrame.answer ?? 0"
        :frame="frame"
        :cases="squareRootApproaches[approach].cases"
        :editing="editing"
      />
    </template>
  </QuestionWorkspace>
</template>

<style scoped>
.approach-options {
  display: flex;
  align-items: center;
  gap: var(--algo-space-3);
  margin-bottom: var(--algo-space-3);
}
.variation-label {
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.variation-switch {
  display: inline-flex;
  gap: var(--algo-space-1);
  padding: var(--algo-space-1);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
}
.variation-switch button {
  border: 1px solid transparent;
  border-radius: var(--algo-radius-sm);
  padding: var(--algo-space-1) var(--algo-space-2);
  background: transparent;
  color: var(--algo-muted);
  font: inherit;
  font-size: var(--algo-text-sm);
  cursor: pointer;
}
.variation-switch button[aria-pressed='true'] {
  border-color: var(--algo-line);
  color: var(--algo-ink);
  background: var(--algo-paper);
}
.variation-switch button:hover {
  color: var(--algo-ink);
}
</style>

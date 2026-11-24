<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@lucide/vue'
import MountainArray from './MountainArray.vue'
import LessonPairSwitch from './LessonPairSwitch.vue'
import MidpointRuleVisualization from './MidpointRuleVisualization.vue'
import type { ArrayMarker } from './LessonArray.vue'
import { leftNeighborFailure, rightNeighborSolution } from '../lessons/mountainPeakWalkthrough'

const props = defineProps<{
  stage: string
  values: readonly number[]
}>()
const pairStart = defineModel<number>('pairStart', { required: true })
const endpoint = defineModel<'first' | 'last'>('endpoint', { required: true })
const last = computed(() => props.values.length - 1)
const endpointIndex = computed(() => (endpoint.value === 'first' ? 0 : last.value - 1))
const endpointMarkers = computed<ArrayMarker[]>(() => [
  { index: endpointIndex.value, label: 'left', tone: 'accent', pointer: true },
  { index: endpointIndex.value + 1, label: 'right', tone: 'accent', pointer: true },
])
const rightMarkers: ArrayMarker[] = [
  {
    index: rightNeighborSolution.mid,
    label: 'mid',
    tone: 'accent',
    pointer: true,
    pointerTone: 'accent',
  },
  { index: rightNeighborSolution.left, label: 'left', tone: 'accent', pointer: true },
  {
    index: rightNeighborSolution.neighbor,
    label: 'mid + 1',
    valueSeparator: '→',
    tone: 'success',
    pointer: true,
    pointerTone: 'success',
  },
  { index: rightNeighborSolution.right, label: 'right', tone: 'success', pointer: true },
]
const explanation = computed(() =>
  props.stage === 'left-neighbor'
    ? leftNeighborFailure.explanation
    : props.stage === 'right-neighbor'
      ? rightNeighborSolution.explanation
      : [],
)
const expressionRows = computed(() =>
  Math.max(2, ...explanation.value.map((step) => step.expressions.length)),
)
const failure = leftNeighborFailure.frame
const failedMarkers: ArrayMarker[] = [
  { index: failure.mid, label: 'mid', tone: 'accent', pointer: true, pointerTone: 'accent' },
  { index: failure.left, label: 'left', tone: 'accent', pointer: true },
  { index: failure.right, label: 'right', tone: 'success', pointer: true },
  { index: failure.neighbor, label: 'A[−1]', tone: 'error' },
]
</script>

<template>
  <div class="reasoning-example">
    <div v-if="stage === 'endpoints'" class="experiment-controls">
      <LessonPairSwitch
        :selected="endpoint"
        label="Mountain endpoint"
        @select="endpoint = $event"
      />
    </div>
    <MidpointRuleVisualization
      v-if="stage === 'midpoint'"
      v-model:pair-start="pairStart"
      :length="values.length"
    />

    <template v-else-if="stage === 'endpoints'">
      <MountainArray
        :values="values"
        label="Mountain endpoint array"
        :description="endpoint === 'first' ? 'First pair rises.' : 'Last pair falls.'"
        :comparison="{ from: endpointIndex, to: endpointIndex + 1 }"
        :markers="endpointMarkers"
        :range="{ left: endpointIndex, right: endpointIndex + 1 }"
      />
    </template>

    <template v-else-if="stage === 'left-neighbor'">
      <MountainArray
        :values="leftNeighborFailure.values"
        class="left-neighbor-array"
        label="Left-neighbor counterexample"
        :description="`Only indices ${failure.left} and ${failure.right} remain. The left-neighbor lookup at index ${failure.mid} reads index ${failure.neighbor} instead.`"
        :comparison="{ from: failure.mid, to: failure.neighbor, tone: 'error' }"
        :markers="failedMarkers"
        :range="{ left: failure.left, right: failure.right }"
      />
    </template>

    <template v-else-if="stage === 'right-neighbor'">
      <MountainArray
        :values="rightNeighborSolution.values"
        class="right-neighbor-array"
        label="Right-neighbor array"
        :description="`Range [${rightNeighborSolution.left}, ${rightNeighborSolution.right}] gives midpoint ${rightNeighborSolution.mid}. Compare it with its right neighbor at index ${rightNeighborSolution.neighbor}.`"
        :comparison="{ from: rightNeighborSolution.mid, to: rightNeighborSolution.neighbor }"
        :range="{ left: rightNeighborSolution.left, right: rightNeighborSolution.right }"
        :rise="112"
        :markers="rightMarkers"
      />
    </template>
    <ol
      v-if="explanation.length"
      class="reasoning-flow"
      :style="{ '--expression-rows': expressionRows }"
      :aria-label="
        stage === 'left-neighbor' ? 'Why the peak is skipped' : 'Right-neighbor search steps'
      "
    >
      <li v-for="(step, index) in explanation" :key="step.title" :class="step.tone">
        <div class="explanation-heading">
          <span class="explanation-number algo-mono" aria-hidden="true">{{ index + 1 }}</span>
          <h3>{{ step.title }}</h3>
        </div>
        <div class="explanation-expressions">
          <code v-for="expression in step.expressions" :key="expression">{{ expression }}</code>
        </div>
        <p>{{ step.detail }}</p>
        <ArrowRight
          v-if="index < explanation.length - 1"
          class="explanation-connector"
          :size="16"
          aria-hidden="true"
        />
      </li>
    </ol>
  </div>
</template>

<style scoped>
.reasoning-example {
  max-width: 1040px;
  margin-inline: auto;
}
.experiment-controls {
  display: flex;
  justify-content: center;
  margin-bottom: var(--algo-space-4);
}
.right-neighbor-array {
  --mountain-pointer-space: var(--algo-pointer-top-space);
}
.left-neighbor-array,
.right-neighbor-array {
  --mountain-bottom-space: var(--algo-space-4);
}
.reasoning-flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--algo-space-8);
  margin: 0;
  padding: var(--algo-space-5) 0 0;
  border-top: 1px solid var(--algo-line);
  list-style: none;
}
.reasoning-flow li {
  position: relative;
}
.explanation-heading {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-2);
  margin-bottom: var(--algo-space-3);
}
.explanation-number {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.explanation-heading h3 {
  color: var(--algo-ink);
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.explanation-expressions {
  min-height: calc(var(--expression-rows) * 1.6em);
  font-size: var(--algo-text-body);
}
.reasoning-flow code {
  display: block;
  white-space: pre;
  color: var(--algo-secondary);
  font: var(--algo-text-body)/1.6 var(--algo-mono);
}
.reasoning-flow .accent code:last-child {
  color: var(--algo-accent);
}
.reasoning-flow .error code {
  color: var(--algo-error);
}
.reasoning-flow .success code {
  color: var(--algo-success);
}
.reasoning-flow p {
  margin-top: var(--algo-space-2);
  color: var(--algo-muted);
  font-size: var(--algo-text-base);
  line-height: 1.7;
}
.explanation-connector {
  position: absolute;
  top: 2px;
  right: calc(-1 * var(--algo-space-6));
  color: var(--algo-line);
}
</style>

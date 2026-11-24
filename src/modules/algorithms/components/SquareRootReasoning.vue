<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import LessonArray, { type ArrayMarker } from './LessonArray.vue'
import LessonComparison from './LessonComparison.vue'
import LessonWalkthrough from './LessonWalkthrough.vue'
import MidpointCalculation from './MidpointCalculation.vue'
import MidpointRuleVisualization from './MidpointRuleVisualization.vue'
import SearchDecisionCards from './SearchDecisionCards.vue'
import type { SquareRootApproach } from '../domain/squareRoot'
import { squareRootApproaches } from '../lessons/squareRoot'
import {
  squareRootReasoningStages,
  squareRootReasoningExample as example,
} from '../lessons/squareRootWalkthrough'

const stage = ref('midpoint')
const pairStart = ref<number>(example.pairStart)
const mids = reactive({ lower: example.lower, upper: example.upper })
const rootPosition = `${((example.root - example.lower) / (example.upper - example.lower)) * 100}%`
const boundaries = computed(() => ({ lower: boundary('lower'), upper: boundary('upper') }))

function boundary(variant: SquareRootApproach) {
  const mid = mids[variant]
  const square = mid * mid
  const lower = variant === 'lower'
  const outcome = lower ? square <= example.n : square >= example.n
  const searchRight = lower ? outcome : !outcome
  const markers: ArrayMarker[] = [
    { index: mid, label: 'mid', tone: 'accent', pointerTone: 'accent' },
    { index: example[variant], label: 'target', tone: 'success', pointerTone: 'success' },
  ]
  return {
    markers,
    outcome,
    formula: lower ? 'mid² ≤ n' : 'mid² ≥ n',
    comparison: `${mid}² = ${square} ${lower ? '≤' : '≥'} ${example.n}`,
    range: searchRight ? { left: mid + 1, right: example.n } : { left: 0, right: mid - 1 },
    cases: squareRootApproaches[variant].cases,
  }
}
function selectMid(variant: string, candidate: number) {
  if (variant === 'lower' || variant === 'upper') mids[variant] = candidate
}
</script>

<template>
  <LessonWalkthrough
    v-model="stage"
    :stages="squareRootReasoningStages"
    label="Reasoning"
    :show-label="false"
  >
    <template #actions="{ stage }">
      <MidpointCalculation v-if="stage === 'midpoint'" :left="pairStart" :right="pairStart + 1" />
      <LessonComparison
        v-else-if="stage === 'required'"
        :formula="`${example.lower}² ≤ n < ${example.upper}²`"
        :comparison="`${example.lower ** 2} ≤ ${example.n} < ${example.upper ** 2}`"
        :result="`Return ${example.result}`"
        tone="success"
      />
      <LessonComparison
        v-else-if="stage === 'lower' || stage === 'upper'"
        :formula="boundaries[stage].formula"
        :comparison="boundaries[stage].comparison"
        :result="String(boundaries[stage].outcome)"
        :tone="boundaries[stage].outcome ? 'success' : 'accent'"
      />
    </template>
    <template #default="{ stage }">
      <MidpointRuleVisualization
        v-if="stage === 'midpoint'"
        v-model:pair-start="pairStart"
        :length="example.candidates.length"
        label="Midpoint candidates"
      />

      <figure
        v-else-if="stage === 'required'"
        class="root-bracket"
        :aria-label="`The square root of ${example.n} lies between ${example.lower} and ${example.upper}. Return ${example.result}.`"
      >
        <div class="root-line" aria-hidden="true">
          <span class="root-endpoint lower">
            <strong>{{ example.lower }}</strong>
            <code>{{ example.lower }}² = {{ example.lower ** 2 }}</code>
          </span>
          <span class="root-position" :style="{ left: rootPosition }">
            <code>√{{ example.n }} ≈ {{ example.root.toFixed(3) }}</code>
          </span>
          <span class="root-endpoint upper">
            <strong>{{ example.upper }}</strong>
            <code>{{ example.upper }}² = {{ example.upper ** 2 }}</code>
          </span>
        </div>
      </figure>

      <div v-else-if="stage === 'lower' || stage === 'upper'" class="boundary-example">
        <p class="candidate-caption">
          Candidate numbers
          <code>0 … {{ example.n }}</code>
        </p>
        <LessonArray
          :values="example.candidates"
          :label="`${stage === 'lower' ? 'Lower' : 'Upper'} candidate numbers`"
          :markers="boundaries[stage].markers"
          :range="boundaries[stage].range"
          :cell-label="(value) => `Try candidate ${value} as mid`"
          indices-only
          pointer-labels
          interactive
          @select="selectMid(stage, $event)"
        />
        <SearchDecisionCards
          class="boundary-decisions"
          :cases="boundaries[stage].cases"
          :outcome="boundaries[stage].outcome"
        />
      </div>

      <div v-else-if="stage === 'example'" class="result-comparison">
        <section class="result-method" aria-label="Lower-candidate result">
          <h3>Lower candidate</h3>
          <LessonComparison
            :formula="`Saved candidate = ${example.lower}`"
            :comparison="`${example.lower}² ≤ ${example.n}`"
            :result="`Return ${example.result}`"
            tone="success"
          />
        </section>
        <section class="result-method" aria-label="Upper-candidate result">
          <h3>Upper candidate</h3>
          <LessonComparison
            :formula="`Saved candidate = ${example.upper}`"
            :comparison="`${example.upper}² > ${example.n}`"
            :result="`Return ${example.upper} − 1 = ${example.result}`"
            tone="success"
          />
        </section>
      </div>
    </template>
  </LessonWalkthrough>
</template>

<style scoped>
.boundary-example,
.result-comparison {
  max-width: 1040px;
  margin-inline: auto;
  padding-bottom: var(--algo-space-6);
}
.candidate-caption {
  display: flex;
  gap: var(--algo-space-3);
  margin: 0;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.candidate-caption code {
  font-family: var(--algo-mono);
}
.boundary-decisions {
  margin-top: var(--algo-space-6);
}
.root-bracket {
  max-width: 680px;
  margin: var(--algo-space-12) auto;
  padding: var(--algo-space-12) var(--algo-space-8);
}
.root-line {
  position: relative;
  height: 2px;
  margin-bottom: var(--algo-space-12);
  background: var(--algo-line);
}
.root-endpoint {
  position: absolute;
  top: 0;
  display: grid;
  justify-items: center;
  gap: var(--algo-space-2);
  transform: translateX(-50%);
}
.root-endpoint::before {
  content: '';
  width: 2px;
  height: var(--algo-space-3);
  margin-top: -5px;
  background: var(--algo-muted);
}
.root-endpoint.lower {
  left: 0;
  color: var(--algo-success);
}
.root-endpoint.upper {
  left: 100%;
  color: var(--algo-secondary);
}
.root-endpoint strong {
  font: 500 var(--algo-text-title) var(--algo-mono);
}
.root-endpoint code {
  color: var(--algo-muted);
  font: var(--algo-text-base) var(--algo-mono);
  white-space: nowrap;
}
.root-position {
  position: absolute;
  top: 0;
  color: var(--algo-accent);
}
.root-position::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
}
.root-position code {
  position: absolute;
  bottom: var(--algo-space-5);
  transform: translateX(-50%);
  font: var(--algo-text-value) var(--algo-mono);
  white-space: nowrap;
}
.result-comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--algo-space-12);
  margin-top: var(--algo-space-8);
}
.result-method h3 {
  margin-bottom: var(--algo-space-4);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  font-weight: 500;
}
</style>

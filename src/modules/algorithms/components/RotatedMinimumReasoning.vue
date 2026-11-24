<script setup lang="ts">
import { computed, ref } from 'vue'
import LessonWalkthrough from './LessonWalkthrough.vue'
import LessonComparison from './LessonComparison.vue'
import ProfileArray from './ProfileArray.vue'
import SearchDecisionCards from './SearchDecisionCards.vue'
import type { ArrayMarker } from './LessonArray.vue'
import { rotatedMinimumApproach } from '../lessons/rotatedMinimum'
import {
  rotatedMinimumReasoningStages,
  rotatedReasoningExample as example,
  rotatedEqualityExample as equality,
} from '../lessons/rotatedMinimumWalkthrough'

const stage = ref('shape')
const mid = ref(2)
const last = example.values.length - 1
const fixedLast = example.values[last]!
const targetMarker: ArrayMarker = {
  index: example.minimum,
  label: 'target',
  tone: 'success',
  pointer: true,
  pointerTone: 'success',
}
const outcome = computed(() => example.values[mid.value]! <= fixedLast)
const comparisonMarkers = computed<ArrayMarker[]>(() => [
  { index: mid.value, label: 'mid', tone: 'accent', pointer: true, pointerTone: 'accent' },
  { index: last, label: 'last', valueSeparator: '→', pointer: true },
  targetMarker,
])
const equalityMarkers: ArrayMarker[] = [
  { index: equality.minimum, label: 'mid', tone: 'success', pointer: true, pointerTone: 'accent' },
  { index: equality.minimum, label: 'last', valueSeparator: '→', tone: 'success', pointer: true },
]
const equalityValue = equality.values[equality.minimum]
</script>

<template>
  <LessonWalkthrough
    v-model="stage"
    :stages="rotatedMinimumReasoningStages"
    label="Reasoning"
    :show-label="false"
  >
    <template #actions="{ stage }">
      <LessonComparison
        v-if="stage === 'fixed-last'"
        data-testid="rotated-fixed-last-comparison"
        formula="A[mid] ≤ A[−1]"
        :comparison="`${example.values[mid]} ≤ ${fixedLast}`"
        :result="String(outcome)"
        :tone="outcome ? 'success' : 'accent'"
      />
    </template>
    <template #default="{ stage }">
      <div class="rotated-reasoning">
        <template v-if="stage === 'shape'">
          <ProfileArray
            :values="example.values"
            label="Rotated array shape"
            :markers="[targetMarker]"
            :highlighted="[example.minimum - 1, example.minimum]"
          />
          <div
            class="run-labels"
            :style="{ '--array-length': example.values.length }"
            aria-label="Two rising runs"
          >
            <span :style="{ gridColumn: `1 / ${example.minimum + 1}` }">Rising</span>
            <span :style="{ gridColumn: `${example.minimum + 1} / -1` }">Rising again</span>
          </div>
        </template>

        <template v-else-if="stage === 'neighbors'">
          <ProfileArray
            :values="example.values"
            label="Neighbor comparison array"
            :markers="[targetMarker]"
            :highlighted="example.pairs.flatMap((pair) => [pair.left, pair.right])"
          />
          <div class="comparison-cases" aria-label="Rising pairs on both sides">
            <LessonComparison
              v-for="pair in example.pairs"
              :key="pair.left"
              :formula="`A[${pair.left}] < A[${pair.right}]`"
              :comparison="`${example.values[pair.left]} < ${example.values[pair.right]} → true`"
              :result="pair.result"
            />
          </div>
        </template>

        <template v-else-if="stage === 'fixed-last'">
          <ProfileArray
            :values="example.values"
            label="Compare a midpoint with the fixed last element"
            :markers="comparisonMarkers"
            :highlighted="[mid, last]"
            interactive
            @select="mid = $event"
          />
          <SearchDecisionCards
            class="reasoning-decisions"
            :cases="rotatedMinimumApproach.cases"
            :outcome="outcome"
          >
            <template #details="{ rule }">
              <p class="decision-explanation">
                {{
                  rule.value
                    ? 'mid may be the target. Check earlier indices.'
                    : 'The target must be to the right.'
                }}
              </p>
              <div class="decision-updates algo-mono">
                <code v-if="rule.value">answer ← mid</code>
                <code>{{ rule.value ? 'right ← mid − 1' : 'left ← mid + 1' }}</code>
              </div>
            </template>
          </SearchDecisionCards>
        </template>

        <template v-else-if="stage === 'equality'">
          <ProfileArray
            :values="equality.values"
            label="Target at the last index"
            :markers="equalityMarkers"
            :highlighted="[equality.minimum]"
          />
          <div class="comparison-cases" aria-label="Strict versus inclusive comparison">
            <LessonComparison
              formula="A[mid] < A[−1]"
              :comparison="`${equalityValue} < ${equalityValue} → false`"
              result="Rejects the target"
              tone="error"
            />
            <LessonComparison
              formula="A[mid] ≤ A[−1]"
              :comparison="`${equalityValue} ≤ ${equalityValue} → true`"
              :result="`Saves target index ${equality.minimum}`"
              tone="success"
            />
          </div>
        </template>
      </div>
    </template>
  </LessonWalkthrough>
</template>

<style scoped>
.rotated-reasoning {
  max-width: 1040px;
  margin-inline: auto;
  padding-bottom: var(--algo-space-6);
}
.run-labels {
  display: grid;
  grid-template-columns: repeat(var(--array-length), minmax(0, 1fr));
  gap: var(--algo-space-2);
  margin-top: var(--algo-space-5);
  color: var(--algo-muted);
  font-size: var(--algo-text-base);
  text-align: center;
}
.run-labels span {
  border-top: 1px solid var(--algo-line);
  padding-top: var(--algo-space-2);
}
.comparison-cases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--algo-space-8);
  margin-top: var(--algo-space-8);
}
.reasoning-decisions {
  margin-top: var(--algo-space-8);
}
.decision-explanation {
  margin: var(--algo-space-1) 0 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
}
.decision-updates {
  display: flex;
  flex-direction: column;
  color: var(--algo-ink);
  font-size: var(--algo-text-base);
  line-height: 1.7;
}
.decision-updates code {
  font: inherit;
}
</style>

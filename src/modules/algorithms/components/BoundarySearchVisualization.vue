<script setup lang="ts">
import BoundaryVisualization from './BoundaryVisualization.vue'
import SearchDecisionCards from './SearchDecisionCards.vue'
import {
  searchDecisionOutcome,
  type SearchDecisionCase,
  type SearchDivision,
} from '../domain/searchPresentation'
import type { SearchFrame } from '../domain/binarySearch'

defineProps<{
  values: readonly (boolean | number)[]
  frame: SearchFrame<string>
  division?: SearchDivision
  arrayLabel?: string
  cases: readonly SearchDecisionCase[]
  target?: number
  exact?: boolean
  editing: boolean
}>()
</script>

<template>
  <div class="solution-decisions" :class="{ editing }">
    <SearchDecisionCards :cases="cases" :outcome="searchDecisionOutcome(frame, exact)" />
  </div>
  <BoundaryVisualization
    class="search-solution-array"
    minimal
    :values="values"
    :frame="frame"
    :division="division"
    :target="target"
    :array-label="arrayLabel"
  >
    <template v-if="$slots.backdrop" #backdrop>
      <slot name="backdrop" />
    </template>
  </BoundaryVisualization>
</template>

<style scoped>
.solution-decisions {
  padding: var(--algo-space-2) var(--algo-space-5) 0;
}
.solution-decisions .search-decisions {
  max-width: 28rem;
  margin-inline: auto;
}
.solution-decisions.editing {
  visibility: hidden;
}
.search-solution-array {
  min-height: 0;
  padding-top: var(--algo-space-2);
  padding-inline: var(--algo-space-8);
}
</style>

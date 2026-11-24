<script setup lang="ts">
import PointerRuleCards from './PointerRuleCards.vue'
import type { PointerRule } from '../domain/twoPointers'

defineProps<{
  rules: readonly PointerRule[]
  outcome: boolean | null
  instruction: string
  editing: boolean
}>()
</script>

<template>
  <div class="solution-pointer-rules" :class="{ editing }">
    <PointerRuleCards :rules="rules" :outcome="outcome" :instruction="instruction" numbered compact>
      <template #action-end="{ rule, index }">
        <slot name="action-end" :rule="rule" :index="index" />
      </template>
    </PointerRuleCards>
  </div>
</template>

<style scoped>
.solution-pointer-rules {
  padding: var(--algo-space-2) var(--algo-space-5) 0;
}
.pointer-rules {
  max-width: var(--algo-solution-rules-width, 30rem);
  margin-inline: auto;
}
.solution-pointer-rules :deep(.rule-actions) {
  flex-direction: column;
  align-items: flex-start;
}
.editing {
  visibility: hidden;
}
</style>

<script setup lang="ts">
import { ChevronsRight } from '@lucide/vue'
import ApproachPatternHeading from './ApproachPatternHeading.vue'
import PointerRuleCards from './PointerRuleCards.vue'
import type { PointerApproach } from '../domain/twoPointers'

defineProps<{
  approach: PointerApproach
  label: string
  technique?: string
  compact?: boolean
  interactive?: boolean
}>()
</script>

<template>
  <section class="pointer-approach" :class="{ compact }" :aria-label="label">
    <ApproachPatternHeading
      :pattern="approach.pattern"
      :variation="approach.variation"
      :technique="technique"
    >
      <template #symbol><ChevronsRight :size="24" :stroke-width="1.7" /></template>
    </ApproachPatternHeading>

    <div class="approach-summary">
      <section class="roles-summary" aria-label="Pointer roles">
        <h2>Roles</h2>
        <dl class="pointer-roles">
          <div v-for="role in approach.roles" :key="role.name">
            <dt class="algo-mono">
              <span class="role-name">{{ role.name }}</span>
              <span class="role-initial">← {{ role.initial }}</span>
            </dt>
            <dd>{{ role.description }}</dd>
          </div>
        </dl>
      </section>
      <section class="return-rule" aria-label="Return value">
        <h2>Result</h2>
        <p v-if="compact" class="result-expression">
          <span>{{ approach.resultDescription }}</span>
          <span class="result-equals">=</span>
          <code>{{ approach.result }}</code>
        </p>
        <template v-else>
          <code>{{ approach.result }}</code>
          <span>{{ approach.resultDescription }}</span>
        </template>
      </section>
    </div>

    <h2 class="rules-heading">Rules</h2>
    <PointerRuleCards
      :rules="approach.rules"
      :outcome="null"
      numbered
      :compact="compact"
      :interactive="interactive"
    >
      <template #default="{ rule, activeAction }">
        <slot :rule="rule" :active-action="activeAction" />
      </template>
    </PointerRuleCards>
  </section>
</template>

<style scoped>
.pointer-approach {
  --algo-array-gap: var(--algo-space-2);
}
.pointer-approach h2 {
  margin: 0;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
  font-weight: 500;
}
.approach-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-block: var(--algo-space-5);
}
.pointer-roles {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--algo-space-2) var(--algo-space-6);
  margin: var(--algo-space-2) 0 0;
  font-size: var(--algo-text-base);
}
.pointer-roles > div {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: baseline;
}
.pointer-roles dt {
  display: grid;
  grid-template-columns: 5ch auto;
  column-gap: 1ch;
  color: var(--algo-ink);
  white-space: nowrap;
}
.pointer-roles dd {
  margin: 0;
  color: var(--algo-secondary);
}
.return-rule {
  display: grid;
  gap: var(--algo-space-1);
  min-width: 10rem;
}
.return-rule code {
  font: var(--algo-text-value) var(--algo-mono);
}
.return-rule > span {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.pointer-approach .rules-heading {
  margin-bottom: var(--algo-space-2);
}
.compact .approach-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: baseline;
  gap: var(--algo-space-3);
  margin-block: var(--algo-space-4);
}
.compact h2 {
  font-size: var(--algo-text-xs);
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.compact .roles-summary,
.compact .return-rule {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-4);
}
.compact .pointer-roles {
  grid-template-columns: max-content max-content;
  gap: var(--algo-space-1) var(--algo-space-4);
  margin: 0;
}
.compact .role-name {
  font-weight: 600;
}
.compact .role-initial {
  color: var(--algo-secondary);
}
.compact .return-rule {
  min-width: 0;
}
.compact .result-expression {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-2);
  margin: 0;
  font-size: var(--algo-text-base);
  white-space: nowrap;
}
.compact .result-equals {
  color: var(--algo-muted);
}
.compact .return-rule code {
  padding: 2px 6px;
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  font-size: var(--algo-text-base);
  font-weight: 550;
}
</style>

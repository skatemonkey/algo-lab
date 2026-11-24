<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight } from '@lucide/vue'
import type { PointerRule } from '../domain/twoPointers'

const props = defineProps<{
  rules: readonly PointerRule[]
  outcome: boolean | null
  instruction?: string
  numbered?: boolean
  interactive?: boolean
  compact?: boolean
}>()

type Action = { rule: boolean; index: number }
const hoveredAction = ref<Action | null>(null)
const focusedAction = ref<Action | null>(null)
const activeAction = computed(() => hoveredAction.value ?? focusedAction.value)

function isCurrentAction(rule: (typeof props.rules)[number], index: number) {
  return (
    props.outcome === rule.value &&
    !!props.instruction &&
    rule.instructions?.[index] === props.instruction
  )
}
</script>

<template>
  <ul class="pointer-rules" :class="{ numbered, compact }" aria-label="Pointer rules">
    <li
      v-for="rule in rules"
      :key="String(rule.value)"
      class="pointer-rule"
      data-pointer-label-boundary
      :class="{ 'is-active': outcome === rule.value }"
      :aria-current="outcome === rule.value ? 'true' : undefined"
    >
      <code>{{ rule.condition }}</code>
      <p class="rule-actions">
        <component
          :is="interactive ? 'button' : 'span'"
          v-for="(action, index) in rule.actions"
          :key="action"
          :type="interactive ? 'button' : undefined"
          class="rule-action"
          :class="{
            'is-inspected': activeAction?.rule === rule.value && activeAction.index === index,
            'is-current': isCurrentAction(rule, index),
          }"
          :aria-current="isCurrentAction(rule, index) ? 'step' : undefined"
          @pointerenter="interactive && (hoveredAction = { rule: rule.value, index })"
          @pointerleave="hoveredAction = null"
          @focus="interactive && (focusedAction = { rule: rule.value, index })"
          @blur="focusedAction = null"
        >
          <span v-if="numbered" class="action-number algo-mono" aria-hidden="true">
            {{ index + 1 }}
          </span>
          <ArrowRight v-else-if="index" :size="12" aria-hidden="true" />
          <span>{{ action }}</span>
          <slot name="action-end" :rule="rule" :index="index" />
        </component>
      </p>
      <slot
        :rule="rule"
        :active-action="activeAction?.rule === rule.value ? activeAction.index : null"
      />
    </li>
  </ul>
</template>

<style scoped>
.pointer-rules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--algo-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}
.pointer-rule {
  display: flex;
  flex-direction: column;
  gap: var(--algo-space-2);
  padding: var(--algo-space-3);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-paper);
  box-shadow: inset 2px 0 0 transparent;
}
.pointer-rule.is-active {
  border-color: var(--algo-selected-line);
  background: var(--algo-selected-soft);
  box-shadow: inset 2px 0 0 var(--algo-ink);
}
.pointer-rule code {
  font: 700 var(--algo-text-body) / var(--algo-space-5) var(--algo-mono);
  white-space: nowrap;
}
.rule-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--algo-space-1);
  margin: 0;
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
}
.rule-action {
  display: inline-flex;
  align-items: center;
  gap: var(--algo-space-1);
  white-space: nowrap;
}
.rule-actions svg {
  flex-shrink: 0;
}
button.rule-action {
  padding: var(--algo-space-1);
  margin: calc(-1 * var(--algo-space-1));
  border: 0;
  border-radius: var(--algo-radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
button.rule-action.is-inspected {
  background: var(--algo-accent-soft);
  color: var(--algo-accent);
}
button.rule-action.is-inspected .action-number {
  border-color: var(--algo-accent-line);
  background: var(--algo-accent-line);
  color: var(--algo-accent);
}
.pointer-rule.is-active .rule-actions {
  color: var(--algo-ink);
}
.pointer-rule .rule-action.is-current {
  padding: var(--algo-space-1);
  margin: calc(-1 * var(--algo-space-1));
  border-radius: var(--algo-radius-sm);
  background: var(--algo-paper);
  color: var(--algo-success);
  box-shadow: 0 0 0 1px var(--algo-success-line);
}
.rule-action.is-current .action-number {
  border-color: var(--algo-success);
  background: var(--algo-success);
  color: var(--algo-paper);
}
.numbered .pointer-rule {
  padding: var(--algo-space-4) var(--algo-space-5);
}
.numbered .rule-actions {
  gap: var(--algo-space-2) var(--algo-space-4);
}
.compact .pointer-rule {
  padding: var(--algo-space-4);
}
.action-number {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--algo-line);
  border-radius: 50%;
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
</style>

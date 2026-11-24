<script setup lang="ts">
import { computed } from 'vue'
import type { LessonDefinition, LessonExecution } from '../domain/lesson'

const props = withDefaults(
  defineProps<{
    lesson: Pick<LessonDefinition, 'pseudocode'>
    execution: LessonExecution
    announcement: string
    title?: string
  }>(),
  { title: 'Solution' },
)
const rows = computed(() =>
  props.lesson.pseudocode.map((line, index) => ({ ...line, number: index + 1 })),
)
const currentLine = computed(() =>
  rows.value.find((line) => line.id === props.execution.instruction),
)
const statementResult = computed(() => {
  if (props.execution.outcome !== null) {
    return {
      kind: 'condition',
      value: String(props.execution.outcome),
      label: `Evaluates to ${props.execution.outcome}`,
    }
  }
  const assignments = props.execution.assignments
  if (!assignments?.length) return null
  return {
    kind: 'assignment',
    value: assignments.map(({ value }) => String(value).replace('-', '−')).join(', '),
    label: assignments.map(({ name, value }) => `${name} = ${value}`).join(', '),
  }
})
</script>

<template>
  <aside class="inspector" :aria-label="title">
    <h2 class="solution-heading">{{ title }}</h2>
    <section class="pseudocode" aria-label="Pseudocode">
      <ol class="code-list" aria-label="Algorithm pseudocode">
        <li
          v-for="line in rows"
          :key="line.id"
          class="code-line"
          :class="{ active: execution.instruction === line.id }"
          :data-instruction="line.id"
          :aria-current="execution.instruction === line.id ? 'step' : undefined"
        >
          <span class="line-number algo-mono" aria-hidden="true">
            {{ String(line.number).padStart(2, '0') }}
          </span>
          <code :style="{ '--code-indent-level': line.indent }">{{ line.text }}</code>
          <span
            v-if="execution.instruction === line.id && statementResult"
            class="statement-result algo-mono"
            :data-testid="`${statementResult.kind}-result`"
            :aria-label="statementResult.label"
            :title="statementResult.label"
          >
            {{ statementResult.value }}
          </span>
        </li>
      </ol>
    </section>
    <p v-if="currentLine" class="algo-sr-only" aria-live="polite" aria-atomic="true">
      Line {{ currentLine.number }}: {{ currentLine.text }}.
      {{ statementResult ? `${statementResult.label}.` : '' }}
      {{ announcement }}
    </p>
  </aside>
</template>

<style scoped>
.inspector {
  min-width: 0;
  padding: var(--algo-space-6);
  border-left: 1px solid var(--algo-line);
}
.solution-heading {
  margin-bottom: var(--algo-space-5);
  font-size: var(--algo-text-body);
  font-weight: 500;
}
.pseudocode {
  min-width: 0;
}
.code-list {
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.code-line {
  display: flex;
  position: relative;
  align-items: center;
  height: var(--algo-code-row);
  border-left: 2px solid transparent;
  border-radius: 0 var(--algo-radius-sm) var(--algo-radius-sm) 0;
  color: var(--algo-secondary);
}
.code-line.active {
  color: var(--algo-accent);
  background: var(--algo-accent-soft);
  border-left-color: var(--algo-accent);
}
.line-number {
  flex-shrink: 0;
  width: calc(var(--algo-code-gutter) - 2px);
  padding-left: 5px;
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
}
.code-line.active .line-number {
  color: var(--algo-accent);
}
.code-line code {
  padding-left: calc(var(--code-indent-level) * var(--algo-code-indent));
  min-width: 0;
  margin-right: 8px;
  font: var(--algo-text-body)/18px var(--algo-mono);
  white-space: pre-wrap;
}
.statement-result {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  max-width: 22ch;
  min-height: 24px;
  margin-left: var(--algo-space-1);
  margin-right: var(--algo-space-2);
  padding: 2px var(--algo-space-2);
  border: 1px solid var(--algo-result-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-result-soft);
  color: var(--algo-result);
  overflow-wrap: anywhere;
  text-align: center;
  font-size: var(--algo-text-base);
  font-weight: 500;
  line-height: 14px;
}
</style>

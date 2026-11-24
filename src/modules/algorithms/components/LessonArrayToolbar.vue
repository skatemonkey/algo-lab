<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlidersHorizontal } from '@lucide/vue'
import AlgoButton from './AlgoButton.vue'

import type { ExecutionVariable, LessonFact } from '../domain/lesson'
export type { ExecutionVariable } from '../domain/lesson'

const props = defineProps<{
  variables: readonly ExecutionVariable[]
  length?: number
  facts?: readonly LessonFact[]
  expanded: boolean
  editorId: string
  compact?: boolean
}>()
const emit = defineEmits<{ toggle: []; cancel: []; ready: [] }>()
const trigger = ref<InstanceType<typeof AlgoButton> | null>(null)
const initialized = computed(() => props.variables.filter((variable) => variable.value !== null))
defineExpose({ focus: () => (trigger.value?.$el as HTMLButtonElement | undefined)?.focus() })
</script>

<template>
  <div class="array-toolbar" :class="{ compact }" @keydown.esc.prevent="emit('cancel')">
    <dl
      class="live-variables algo-mono"
      aria-label="Current variables"
      data-testid="live-variables"
    >
      <div
        v-for="variable in initialized"
        :key="variable.name"
        class="live-variable"
        :class="{ updated: variable.updated }"
        :data-variable="variable.name"
      >
        <dt>{{ variable.name }}</dt>
        <dd>{{ String(variable.value).replace('-', '−') }}</dd>
      </div>
    </dl>
    <slot name="controls" />
    <div class="input-facts algo-mono">
      <output
        v-if="length !== undefined"
        class="array-info"
        aria-label="Array length"
        data-testid="array-length"
      >
        n =
        <span>{{ length }}</span>
      </output>
      <output
        v-for="fact in facts"
        :key="fact.id"
        class="array-info"
        :aria-label="fact.description ?? fact.label"
        :data-testid="fact.id"
      >
        {{ fact.label }} =
        <span>{{ fact.value }}</span>
      </output>
    </div>
    <AlgoButton
      ref="trigger"
      icon
      variant="quiet"
      class="edit-inputs"
      aria-label="Edit inputs"
      title="Edit inputs"
      :aria-expanded="expanded"
      :aria-controls="editorId"
      @click="emit('toggle')"
    >
      <SlidersHorizontal :size="17" aria-hidden="true" />
    </AlgoButton>
    <Transition name="array-editor" @after-enter="emit('ready')">
      <div v-if="expanded" :id="editorId" class="array-editor">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.array-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--algo-space-3);
  width: 100%;
  min-height: 60px;
  padding: var(--algo-space-3) var(--algo-space-6);
}
.array-toolbar.compact {
  min-height: 36px;
  padding: 0;
}
.compact .array-editor {
  left: 0;
  right: 0;
}
.live-variables {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
  gap: var(--algo-space-1) var(--algo-space-4);
  margin: 0;
  font-size: var(--algo-text-base);
}
.live-variable {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-2);
  min-width: 0;
  max-width: 100%;
}
.live-variable dt {
  color: var(--algo-muted);
}
.live-variable dd {
  min-width: 2ch;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--algo-ink);
  transition: color var(--algo-motion);
}
.live-variable.updated dd {
  color: var(--algo-accent);
}
.input-facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--algo-space-1) var(--algo-space-3);
  margin-left: auto;
  max-width: 45%;
}
.array-info {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
  white-space: nowrap;
}
.array-info span {
  display: inline-block;
  min-width: 2ch;
}
.edit-inputs {
  flex: 0 0 auto;
}
.edit-inputs[aria-expanded='true'] {
  color: var(--algo-accent);
  background: var(--algo-accent-soft);
}
.array-editor {
  position: absolute;
  z-index: 6;
  top: calc(100% - var(--algo-space-1));
  left: var(--algo-space-6);
  right: var(--algo-space-6);
}
.array-editor-enter-active,
.array-editor-leave-active {
  transition:
    opacity var(--algo-motion),
    transform var(--algo-motion);
}
.array-editor-enter-from,
.array-editor-leave-to {
  opacity: 0;
  transform: translateY(calc(-1 * var(--algo-space-2)));
}
.array-editor-leave-active {
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .array-editor-enter-active,
  .array-editor-leave-active,
  .live-variable dd {
    transition: none;
  }
}
</style>

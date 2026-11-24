<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { ChevronDown } from '@lucide/vue'
import ApproachPatternHeading from './ApproachPatternHeading.vue'
import ApproachOverview from './ApproachOverview.vue'
import LessonArrayToolbar from './LessonArrayToolbar.vue'
import LessonInputPanel from './LessonInputPanel.vue'
import SearchDecisionCards from './SearchDecisionCards.vue'
import type { BoundarySearchApproach } from '../domain/searchPresentation'
import type { LessonFact } from '../domain/lesson'

const props = defineProps<{
  approach: BoundarySearchApproach
  label: string
  outcome: boolean | null
  facts?: readonly LessonFact[]
  presets: readonly string[]
  selectedPreset: string
  active: boolean
  error: string
  dirty: boolean
  applyInput: () => boolean
}>()
const emit = defineEmits<{ edit: []; preset: [index: number]; restore: [] }>()
const editorOpen = ref(false)
const editorId = useId()
const toolbar = ref<InstanceType<typeof LessonArrayToolbar> | null>(null)
const inputFields = ref<HTMLElement | null>(null)
watch(
  () => props.active,
  (active) => {
    if (!active) editorOpen.value = false
  },
)
function focusInput() {
  inputFields.value?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus()
}
function closeEditor() {
  if (!editorOpen.value) return
  emit('edit')
  editorOpen.value = false
  void nextTick(() => toolbar.value?.focus())
}
function toggleEditor() {
  if (editorOpen.value) return closeEditor()
  emit('edit')
  editorOpen.value = true
}
function apply() {
  if (!props.dirty) return
  props.applyInput()
  void nextTick(focusInput)
}
function selectInput(value: string) {
  if (value === 'custom') emit('restore')
  else emit('preset', Number(value))
}
</script>

<template>
  <section class="boundary-approach" :aria-label="`${label} approach`">
    <header class="approach-toolbar">
      <ApproachPatternHeading :pattern="approach.pattern" :variation="approach.variation" />
    </header>

    <div class="approach-overview">
      <ApproachOverview :steps="approach.steps">
        <template #default="{ step }">
          <ul v-if="step.id === 'split'" class="split-cards" aria-label="Array regions">
            <li
              v-for="(region, index) in approach.regions"
              :key="region"
              class="split-card"
              :class="{ 'is-target': index === (approach.targetRegion ?? 1) }"
            >
              <code class="split-condition">{{ region }}</code>
              <p v-if="index === (approach.targetRegion ?? 1)" class="split-card-target">
                <span class="target-label">Target</span>
                <span aria-hidden="true">·</span>
                <span>{{ approach.answerLabel }}</span>
              </p>
            </li>
          </ul>
          <SearchDecisionCards
            v-if="step.id === 'search'"
            class="approach-decisions"
            :cases="approach.cases"
            :outcome="outcome"
          />
        </template>
      </ApproachOverview>

      <LessonArrayToolbar
        ref="toolbar"
        compact
        class="approach-editor"
        :variables="[]"
        :facts="facts"
        :expanded="editorOpen"
        :editor-id="editorId"
        @toggle="toggleEditor"
        @cancel="closeEditor"
        @ready="focusInput"
      >
        <template #controls>
          <label v-if="!editorOpen" class="preset-control">
            <span class="algo-sr-only">Approach input</span>
            <select
              :value="selectedPreset"
              @change="selectInput(($event.target as HTMLSelectElement).value)"
            >
              <option value="custom">Current input</option>
              <option v-for="(preset, index) in presets" :key="preset" :value="String(index)">
                {{ preset }}
              </option>
            </select>
            <ChevronDown :size="14" aria-hidden="true" />
          </label>
        </template>
        <div ref="inputFields">
          <LessonInputPanel
            compact
            restore-current
            :presets="presets"
            :selected-preset="dirty ? 'custom' : selectedPreset"
            :error="error"
            :dirty="dirty"
            @apply="apply"
            @preset="emit('preset', $event)"
            @restore="emit('restore')"
            @cancel="closeEditor"
          >
            <template #default="{ errorId }">
              <slot name="inputs" :error-id="errorId" />
            </template>
          </LessonInputPanel>
        </div>
      </LessonArrayToolbar>
    </div>

    <slot :editing="editorOpen" />
  </section>
</template>

<style scoped>
.boundary-approach {
  --algo-array-gap: var(--algo-space-2);
  padding-bottom: var(--algo-space-3);
}
.approach-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--algo-space-6);
  margin-bottom: var(--algo-space-3);
}
.preset-control {
  position: relative;
  display: flex;
  align-items: center;
}
.preset-control select {
  appearance: none;
  padding: var(--algo-space-1) var(--algo-space-6) var(--algo-space-1) var(--algo-space-3);
  border: 0;
  border-radius: var(--algo-radius-sm);
  background: transparent;
  color: var(--algo-secondary);
  font: inherit;
  font-size: var(--algo-text-base);
  cursor: pointer;
}
.preset-control select:hover {
  background: var(--algo-soft);
}
.preset-control svg {
  position: absolute;
  right: var(--algo-space-1);
  pointer-events: none;
  color: var(--algo-muted);
}
.approach-overview {
  position: relative;
}
.split-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(max-content, 1fr));
  gap: var(--algo-space-3);
  margin: var(--algo-space-1) 0 0;
  padding: 0;
  list-style: none;
}
.split-card {
  display: flex;
  flex-direction: column;
  gap: var(--algo-space-2);
  padding: var(--algo-space-3);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  background: var(--algo-soft);
  color: var(--algo-secondary);
}
.split-card.is-target {
  background: var(--algo-success-soft);
  border-color: var(--algo-success-line);
  color: var(--algo-success);
}
.split-condition {
  font: 700 var(--algo-text-body) / var(--algo-space-5) var(--algo-mono);
}
.split-card-target {
  display: flex;
  align-items: baseline;
  gap: var(--algo-space-1);
  margin: 0;
  font-size: var(--algo-text-sm);
  line-height: var(--algo-space-5);
  white-space: nowrap;
}
.target-label {
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.approach-editor {
  position: absolute;
  bottom: 0;
  pointer-events: none;
}
.approach-editor .preset-control,
.approach-editor :deep(.edit-inputs),
.approach-editor :deep(.array-editor:not(.array-editor-leave-active)) {
  pointer-events: auto;
}
.approach-editor :deep(.input-error) {
  top: auto;
  right: auto;
  bottom: calc(100% + var(--algo-space-1));
}
.approach-decisions {
  margin-top: var(--algo-space-1);
}
</style>

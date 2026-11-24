<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { ChevronRight } from '@lucide/vue'
import { useLessonNavigation } from '../composables/useLessonKeyboard'

const props = withDefaults(
  defineProps<{
    stages: readonly {
      id: string
      label: string
      title?: string
      description?: string
      points?: readonly string[]
    }[]
    variant?: 'steps' | 'sections'
    label?: string
    showLabel?: boolean
  }>(),
  { variant: 'steps', label: 'Reasoning', showLabel: true },
)
const showNavigation = computed(() => props.stages.length > 1)
const numbered = computed(() => props.variant === 'steps')
const stage = defineModel<string>({ required: true })
const id = useId()
const current = computed(
  () => props.stages.find((item) => item.id === stage.value) ?? props.stages[0]!,
)

const root = ref<HTMLElement | null>(null)
useLessonNavigation({
  level: props.variant,
  root,
  count: () => props.stages.length,
  async move(move, { focus = true } = {}) {
    const position = props.stages.findIndex((item) => item.id === current.value.id)
    const target =
      move === 'first'
        ? 0
        : move === 'last'
          ? props.stages.length - 1
          : (position + move + props.stages.length) % props.stages.length
    if (!focus) {
      // Navigation shortcuts use the active indicator; avoid focus on a stale tab or panel.
      const focused = document.activeElement
      if (focused instanceof HTMLElement && root.value?.contains(focused)) focused.blur()
    }
    stage.value = props.stages[target]!.id
    if (!focus) return
    await nextTick()
    root.value
      ?.querySelector<HTMLButtonElement>('.stage-tabs > [aria-selected="true"]')
      ?.focus({ preventScroll: true })
  },
})
</script>

<template>
  <div ref="root" class="lesson-walkthrough" :class="variant">
    <div v-if="numbered && showLabel && showNavigation" :id="`${id}-label`" class="reasoning-label">
      {{ label }}
    </div>
    <div
      v-if="showNavigation"
      class="stage-tabs"
      role="tablist"
      :aria-keyshortcuts="numbered ? 'Shift+[ Shift+]' : 'Shift+ArrowLeft Shift+ArrowRight'"
      :aria-labelledby="numbered && showLabel ? `${id}-label` : undefined"
      :aria-label="numbered ? (showLabel ? undefined : label) : 'Lesson sections'"
    >
      <template v-for="(item, index) in stages" :key="item.id">
        <ChevronRight
          v-if="numbered && index"
          class="step-connector"
          :size="16"
          aria-hidden="true"
        />
        <button
          :id="`${id}-tab-${item.id}`"
          type="button"
          role="tab"
          :aria-label="numbered ? `Step ${index + 1}: ${item.label}` : item.label"
          :aria-selected="current.id === item.id"
          :aria-controls="`${id}-panel-${item.id}`"
          :tabindex="current.id === item.id ? 0 : -1"
          @click="stage = item.id"
        >
          <span v-if="numbered" class="step-number algo-mono" aria-hidden="true">
            {{ index + 1 }}
          </span>
          <span>{{ item.label }}</span>
        </button>
      </template>
    </div>
    <section
      v-for="item in stages"
      v-show="item.id === current.id"
      :key="item.id"
      :id="`${id}-panel-${item.id}`"
      :role="showNavigation ? 'tabpanel' : undefined"
      :aria-labelledby="showNavigation ? `${id}-tab-${item.id}` : undefined"
      :tabindex="showNavigation ? 0 : undefined"
      class="lesson-chapter"
      :class="{ 'is-current': item.id === current.id }"
      :data-chapter="item.id"
    >
      <header v-if="item.title" class="chapter-heading">
        <div class="chapter-introduction">
          <h2>{{ item.title }}</h2>
          <p v-if="item.description">{{ item.description }}</p>
          <ul v-if="item.points?.length" class="chapter-points">
            <li v-for="point in item.points" :key="point">{{ point }}</li>
          </ul>
        </div>
        <div class="chapter-actions"><slot name="actions" :stage="item.id" /></div>
      </header>
      <slot :stage="item.id" />
    </section>
  </div>
</template>

<style scoped>
.lesson-walkthrough {
  position: relative;
}
.reasoning-label {
  position: absolute;
  top: calc(-1 * var(--algo-space-2));
  left: 2px;
  color: color-mix(in srgb, var(--algo-muted) 90%, var(--algo-canvas));
  font-size: var(--algo-text-xs);
  font-weight: 400;
  cursor: default;
}
.stage-tabs {
  display: flex;
  align-items: center;
  gap: var(--algo-space-3);
  border-bottom: 1px solid var(--algo-line);
  margin-bottom: var(--algo-space-5);
}
.stage-tabs button {
  display: flex;
  align-items: center;
  gap: var(--algo-space-2);
  padding: var(--algo-space-3) 2px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--algo-secondary);
  font: inherit;
  font-size: var(--algo-text-base);
  cursor: pointer;
  white-space: nowrap;
}
.step-connector {
  flex-shrink: 0;
  color: var(--algo-muted);
  opacity: 0.55;
}
.step-number {
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border: 1px solid var(--algo-line);
  border-radius: 50%;
  color: var(--algo-muted);
  font-size: var(--algo-text-sm);
}
.stage-tabs button:hover {
  color: var(--algo-accent);
}
.stage-tabs button[aria-selected='true'] {
  color: var(--algo-accent);
  border-bottom-color: var(--algo-accent);
}
.stage-tabs button[aria-selected='true'] .step-number {
  color: var(--algo-paper);
  border-color: var(--algo-accent);
  background: var(--algo-accent);
}
.sections > .stage-tabs {
  gap: var(--algo-space-4);
  margin-bottom: var(--algo-space-2);
  border-bottom: 1px solid var(--algo-line);
}
.sections:has(> .lesson-chapter.is-current > .steps > .stage-tabs) > .stage-tabs {
  margin-bottom: var(--algo-space-1);
  border-bottom-color: transparent;
}
.sections > .stage-tabs button {
  padding: var(--algo-space-1) 2px;
  border: 0;
  border-bottom: 1px solid transparent;
  border-radius: 0;
  color: var(--algo-muted);
  font-size: var(--algo-text-xs);
  font-weight: 400;
}
.sections > .stage-tabs button[aria-selected='true'] {
  color: var(--algo-secondary);
  border-bottom-color: var(--algo-muted);
}
.sections > .stage-tabs button:hover {
  color: var(--algo-accent);
}
.sections .steps > .stage-tabs button {
  padding-block: var(--algo-space-1);
}
.chapter-heading {
  display: flex;
  align-items: flex-start;
  gap: var(--algo-space-6);
  margin-bottom: var(--algo-space-4);
}
.chapter-introduction {
  min-width: 0;
}
h2 {
  color: var(--algo-ink);
  font-size: var(--algo-text-title);
  font-weight: 500;
  letter-spacing: -0.5px;
  line-height: 1.3;
}
p {
  margin-top: var(--algo-space-2);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  line-height: 1.7;
  max-width: 820px;
}
.chapter-points {
  margin: var(--algo-space-1) 0 0;
  padding-left: var(--algo-space-5);
  color: var(--algo-secondary);
  font-size: var(--algo-text-body);
  line-height: 1.7;
}
.chapter-points li + li {
  margin-top: var(--algo-space-1);
}
.chapter-actions {
  display: flex;
  align-items: flex-start;
  flex: 0 0 40ch;
  margin-left: auto;
  font: var(--algo-text-value)/1.6 var(--algo-mono);
}
.chapter-actions:empty {
  display: none;
}
</style>

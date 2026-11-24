<script setup lang="ts">
import { useId } from 'vue'
import { Check, X } from '@lucide/vue'
import AlgoButton from './AlgoButton.vue'
defineProps<{
  presets: readonly string[]
  selectedPreset: string
  error: string
  dirty: boolean
  embedded?: boolean
  compact?: boolean
  restoreCurrent?: boolean
}>()
const emit = defineEmits<{ apply: []; preset: [index: number]; restore: []; cancel: [] }>()
const errorId = useId()
function selectPreset(value: string) {
  if (value === 'custom') emit('restore')
  else emit('preset', Number(value))
}
</script>

<template>
  <form
    class="lesson-input-panel"
    :class="{ embedded, compact }"
    aria-label="Search inputs"
    novalidate
    @submit.prevent="dirty && emit('apply')"
  >
    <div class="input-fields">
      <label class="preset-field">
        <span v-if="!compact">Preset</span>
        <select
          aria-label="Input preset"
          :value="selectedPreset"
          @change="selectPreset(($event.target as HTMLSelectElement).value)"
        >
          <option value="custom" :disabled="!restoreCurrent">
            {{ restoreCurrent ? 'Current input' : 'Custom' }}
          </option>
          <option v-for="(preset, index) in presets" :key="index" :value="String(index)">
            {{ preset }}
          </option>
        </select>
      </label>
      <slot :error-id="errorId" />
      <span class="apply-action">
        <AlgoButton
          v-if="dirty"
          type="submit"
          variant="primary"
          :icon="compact"
          :aria-label="compact ? 'Apply inputs' : undefined"
          :title="compact ? 'Apply inputs' : undefined"
        >
          <Check v-if="compact" :size="17" aria-hidden="true" />
          <template v-else>Apply</template>
        </AlgoButton>
      </span>
      <AlgoButton
        v-if="compact"
        icon
        variant="quiet"
        aria-label="Close input editor"
        title="Close input editor"
        @click="emit('cancel')"
      >
        <X :size="17" aria-hidden="true" />
      </AlgoButton>
    </div>
    <p v-if="error" :id="errorId" class="input-error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.lesson-input-panel {
  padding: var(--algo-space-5) var(--algo-space-6);
  margin-bottom: var(--algo-space-5);
  background: var(--algo-paper);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius);
}
.lesson-input-panel.embedded {
  margin-bottom: 0;
  border: 0;
  border-bottom: 1px solid var(--algo-line);
  border-radius: 0;
  background: var(--algo-soft);
}
.input-fields {
  display: flex;
  align-items: end;
  gap: var(--algo-space-5);
}
.input-fields :deep(label) {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: var(--algo-space-2);
  color: var(--algo-secondary);
  font-size: var(--algo-text-base);
}
.input-fields .preset-field {
  flex: 0 0 180px;
}
.input-fields :deep(input),
.input-fields select {
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 7px 10px;
  background: var(--algo-paper);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius-sm);
  font-size: var(--algo-text-base);
}
.input-fields :deep(input) {
  font-family: var(--algo-mono);
}
.input-fields :deep([aria-invalid='true']) {
  border-color: var(--algo-error);
}
.input-error {
  margin-top: var(--algo-space-3);
  color: var(--algo-error);
  font-size: var(--algo-text-base);
}
.lesson-input-panel.compact {
  position: relative;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.compact .input-fields {
  align-items: center;
  gap: var(--algo-space-2);
}
.compact .preset-field {
  flex-basis: 148px;
}
.compact .input-fields :deep(input),
.compact select {
  height: 40px;
  background: var(--algo-canvas);
}
.compact .apply-action,
.compact .input-fields > :deep(button) {
  flex: 0 0 36px;
}
.apply-action {
  display: flex;
  align-items: center;
}
.compact .input-error {
  position: absolute;
  top: calc(100% + var(--algo-space-1));
  left: 0;
  right: 0;
  margin: 0;
  font-size: var(--algo-text-sm);
}
</style>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  length: number
  boundary: number
  error: string
  errorId: string
}>()
const draftLength = defineModel<string>({ required: true })
const emit = defineEmits<{ boundary: [value: number]; clearError: [] }>()
const boundaryId = useId()
function updateLength(event: Event) {
  draftLength.value = (event.target as HTMLInputElement).value
  emit('clearError')
}
</script>

<template>
  <label class="boolean-input length-field">
    <span class="algo-sr-only">Array length</span>
    <input
      :value="draftLength"
      type="number"
      min="0"
      max="16"
      step="1"
      aria-label="Array length"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      @input="updateLength"
    />
  </label>
  <label class="boolean-input boundary-field" :for="boundaryId">
    <span class="boundary-caption">
      First true
      <output class="algo-mono" :for="boundaryId">
        {{ length === 0 ? '—' : boundary === length ? 'none' : boundary }}
      </output>
    </span>
    <input
      :id="boundaryId"
      :value="boundary"
      @input="emit('boundary', Number(($event.target as HTMLInputElement).value))"
      type="range"
      min="0"
      :max="length"
      :disabled="length === 0"
      :aria-valuetext="
        length === 0
          ? 'Empty array'
          : boundary === length
            ? 'None, all values are false'
            : `Index ${boundary}`
      "
    />
  </label>
</template>

<style scoped>
.boolean-input.length-field {
  flex: 0 0 74px;
}
.boolean-input.boundary-field {
  gap: var(--algo-space-1);
}
.boundary-caption {
  display: flex;
  justify-content: space-between;
  gap: var(--algo-space-2);
  font-size: var(--algo-text-sm);
  color: var(--algo-muted);
}
.boundary-caption output {
  color: var(--algo-accent);
}
.boundary-field input[type='range'] {
  height: 3px;
  padding: 0;
  border: 0;
  accent-color: var(--algo-accent);
  cursor: pointer;
}
.boundary-field input:disabled {
  cursor: default;
  opacity: 0.5;
}
</style>

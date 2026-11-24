<script setup lang="ts">
import { computed } from 'vue'
import LessonArray, { type ArrayMarker } from './LessonArray.vue'

const props = withDefaults(defineProps<{ length: number; label?: string }>(), {
  label: 'Midpoint indices',
})
const pairStart = defineModel<number>('pairStart', { required: true })
const positions = computed(() => Array.from({ length: props.length }, (_, index) => index))
const markers = computed<ArrayMarker[]>(() => [
  { index: pairStart.value, label: 'mid', tone: 'accent', pointerTone: 'accent' },
  { index: pairStart.value, label: 'left', tone: 'accent' },
  { index: pairStart.value + 1, label: 'right', tone: 'success' },
])
</script>

<template>
  <div class="midpoint-rule">
    <LessonArray
      :values="positions"
      :label="label"
      :markers="markers"
      :range="{ left: pairStart, right: pairStart + 1 }"
      indices-only
      pointer-labels
    />
    <input
      v-model.number="pairStart"
      class="midpoint-slider"
      type="range"
      min="0"
      :max="length - 2"
      step="1"
      aria-label="Move the pair"
      :aria-valuetext="`Range [${pairStart}, ${pairStart + 1}], midpoint ${pairStart}`"
    />
  </div>
</template>

<style scoped>
.midpoint-rule {
  max-width: 1040px;
  margin-inline: auto;
}
.midpoint-slider {
  display: block;
  width: 100%;
  height: 20px;
  margin-top: var(--algo-space-6);
  accent-color: var(--algo-accent);
  cursor: pointer;
}
</style>

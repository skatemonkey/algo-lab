<script setup lang="ts">
import ArrayProfileBackdrop from './ArrayProfileBackdrop.vue'
import LessonArray, { type ArrayMarker } from './LessonArray.vue'

defineProps<{
  values: readonly number[]
  label: string
  markers?: readonly ArrayMarker[]
  highlighted?: readonly number[]
  interactive?: boolean
}>()
const emit = defineEmits<{ select: [index: number] }>()
</script>

<template>
  <div class="profile-array">
    <div class="profile-track">
      <ArrayProfileBackdrop
        :values="values"
        :highlighted="highlighted"
        :label="`${label} profile`"
      />
      <LessonArray
        class="profile-cells"
        :values="values"
        :label="label"
        :markers="markers"
        :interactive="interactive"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-array {
  --algo-array-gap: var(--algo-space-2);
  padding-top: var(--algo-pointer-top-space);
}
.profile-track {
  position: relative;
}
.profile-cells {
  position: relative;
  padding-top: 0;
}
.profile-cells :deep(.array-markers) {
  height: 0;
}
.profile-cells :deep(.array-value) {
  background: color-mix(in srgb, var(--algo-paper) 76%, transparent);
}
.profile-cells :deep(.marked .array-value) {
  background: color-mix(in srgb, var(--marker-background) 85%, transparent);
}
</style>

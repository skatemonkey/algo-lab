<script setup lang="ts">
import BoundarySearchVisualization from './BoundarySearchVisualization.vue'
import MountainArrayBackdrop from './MountainArrayBackdrop.vue'
import { mountainPeakApproach } from '../lessons/mountainPeak'
import type { MountainPeakFrame } from '../domain/mountainPeak'

defineProps<{
  values: readonly number[]
  frame: MountainPeakFrame
  boundary: number
  editing: boolean
}>()
</script>

<template>
  <BoundarySearchVisualization
    :values="values"
    :frame="frame"
    :cases="mountainPeakApproach.cases"
    :division="{ index: boundary, before: 'Rising', after: 'Falling' }"
    :editing="editing"
    array-label="Mountain array"
  >
    <template #backdrop>
      <MountainArrayBackdrop :values="values" :left="frame.left" :right="frame.right" />
    </template>
  </BoundarySearchVisualization>
</template>

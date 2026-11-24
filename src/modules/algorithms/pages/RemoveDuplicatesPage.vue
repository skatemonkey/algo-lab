<script setup lang="ts">
import ArrayInputLesson from '../components/ArrayInputLesson.vue'
import RemoveDuplicatesSolution from '../components/RemoveDuplicatesSolution.vue'
import ArrayPointerApproach from '../components/ArrayPointerApproach.vue'
import {
  arrayTransformVariables,
  parseRemoveDuplicatesInput,
  traceRemoveDuplicates,
} from '../domain/twoPointers'
import {
  removeDuplicatesApproach,
  removeDuplicatesExample,
  removeDuplicatesLesson,
  removeDuplicatesPresets,
} from '../lessons/twoPointers'
</script>

<template>
  <ArrayInputLesson
    :lesson="removeDuplicatesLesson"
    :presets="removeDuplicatesPresets"
    input-label="Sorted array"
    :parse-input="parseRemoveDuplicatesInput"
    :trace="traceRemoveDuplicates"
    :variables-for="arrayTransformVariables"
    :result-for="(frame) => frame.result"
  >
    <template #approach>
      <ArrayPointerApproach
        compact
        interactive
        :approach="removeDuplicatesApproach"
        :example="removeDuplicatesExample"
        :trace="traceRemoveDuplicates"
        label="Remove duplicates approach"
      />
    </template>
    <template #visualization="{ frame, previousFrame, pause, editing, active }">
      <RemoveDuplicatesSolution
        :frame="frame"
        :previous-frame="previousFrame"
        :editing="editing"
        :active="active"
        @replay="pause"
      />
    </template>
  </ArrayInputLesson>
</template>

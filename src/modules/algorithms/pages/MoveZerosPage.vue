<script setup lang="ts">
import ArrayInputLesson from '../components/ArrayInputLesson.vue'
import ArrayPointerApproach from '../components/ArrayPointerApproach.vue'
import MoveZerosSolution from '../components/MoveZerosSolution.vue'
import {
  arrayTransformVariables,
  parseIntegerSequence,
  traceMoveZeros,
} from '../domain/twoPointers'
import {
  moveZerosApproach,
  moveZerosExample,
  moveZerosLesson,
  moveZerosPresets,
} from '../lessons/twoPointers'
</script>

<template>
  <ArrayInputLesson
    :lesson="moveZerosLesson"
    :presets="moveZerosPresets"
    input-label="Integer array"
    :parse-input="parseIntegerSequence"
    :trace="traceMoveZeros"
    :variables-for="arrayTransformVariables"
  >
    <template #approach>
      <ArrayPointerApproach
        :approach="moveZerosApproach"
        :example="moveZerosExample"
        :trace="traceMoveZeros"
        label="Move zeros approach"
        compact
        interactive
      />
    </template>
    <template #visualization="{ frame, previousFrame, pause, editing, active }">
      <MoveZerosSolution
        :frame="frame"
        :previous-frame="previousFrame"
        :editing="editing"
        :active="active"
        @replay="pause"
      />
    </template>
    <template #result="{ frame }">
      <span data-testid="search-result">A = [{{ frame.values.join(', ') }}]</span>
    </template>
  </ArrayInputLesson>
</template>

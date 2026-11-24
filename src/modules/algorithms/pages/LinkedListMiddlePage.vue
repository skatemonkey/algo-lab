<script setup lang="ts">
import ArrayInputLesson from '../components/ArrayInputLesson.vue'
import LinkedListMiddleApproach from '../components/LinkedListMiddleApproach.vue'
import LinkedListMiddleSolution from '../components/LinkedListMiddleSolution.vue'
import {
  linkedListVariables,
  parseLinkedListInput,
  traceLinkedListMiddle,
} from '../domain/twoPointers'
import { linkedListMiddleLesson, linkedListMiddlePresets } from '../lessons/twoPointers'
</script>

<template>
  <ArrayInputLesson
    :lesson="linkedListMiddleLesson"
    :presets="linkedListMiddlePresets"
    input-label="Node values"
    :limit="10"
    :parse-input="parseLinkedListInput"
    :trace="traceLinkedListMiddle"
    :variables-for="linkedListVariables"
    :result-for="(frame) => frame.result"
  >
    <template #approach><LinkedListMiddleApproach /></template>
    <template #visualization="{ frame, previousFrame, values, editing, active }">
      <LinkedListMiddleSolution
        :values="values"
        :frame="frame"
        :previous-frame="previousFrame"
        :editing="editing"
        :active="active"
      />
    </template>
  </ArrayInputLesson>
</template>

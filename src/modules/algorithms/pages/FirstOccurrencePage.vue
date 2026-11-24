<script setup lang="ts">
import IntegerSearchLesson from '../components/IntegerSearchLesson.vue'
import {
  firstOccurrenceApproach,
  firstOccurrencePresets,
  firstOccurrenceLesson,
} from '../lessons/firstOccurrence'
</script>

<template>
  <IntegerSearchLesson
    :lesson="firstOccurrenceLesson"
    :approach="firstOccurrenceApproach"
    :presets="firstOccurrencePresets"
    mode="exact"
  />
</template>

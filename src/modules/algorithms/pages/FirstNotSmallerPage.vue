<script setup lang="ts">
import IntegerSearchLesson from '../components/IntegerSearchLesson.vue'
import {
  firstNotSmallerApproach,
  firstNotSmallerPresets,
  firstNotSmallerLesson,
} from '../lessons/firstNotSmaller'
</script>

<template>
  <IntegerSearchLesson
    :lesson="firstNotSmallerLesson"
    :approach="firstNotSmallerApproach"
    :presets="firstNotSmallerPresets"
    mode="at-least"
  />
</template>

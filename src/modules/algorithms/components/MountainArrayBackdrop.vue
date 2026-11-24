<script setup lang="ts">
import ArrayProfileBackdrop from './ArrayProfileBackdrop.vue'
defineProps<{ values: readonly number[]; left: number; right: number }>()
</script>

<template>
  <ArrayProfileBackdrop
    class="mountain-backdrop"
    :values="values"
    :left="left"
    :right="right"
    label="Mountain profile behind the array"
  />
</template>

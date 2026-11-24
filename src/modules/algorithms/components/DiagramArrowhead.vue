<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <marker
    :id="id"
    markerUnits="userSpaceOnUse"
    markerWidth="4"
    markerHeight="8"
    refX="0"
    refY="4"
    orient="auto"
  >
    <path d="M 0 0 L 4 4 L 0 8 Z" fill="currentColor" />
  </marker>
</template>

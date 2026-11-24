<script setup lang="ts">
import { ref } from 'vue'
import { provideLessonKeyboard } from './composables/useLessonKeyboard'
import { RouterView } from 'vue-router'
import './styles/theme.css'

const root = ref<HTMLElement | null>(null)
provideLessonKeyboard(root)
</script>

<template>
  <div ref="root" class="algorithms-module">
    <RouterView />
  </div>
</template>

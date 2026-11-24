<script setup lang="ts">
const value = defineModel<string>({ required: true })
defineProps<{ error: string; errorId: string }>()
const emit = defineEmits<{ clearError: [] }>()
</script>

<template>
  <label>
    <span class="algo-sr-only">Non-negative integer n</span>
    <input
      v-model="value"
      aria-label="Non-negative integer n"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      inputmode="numeric"
      autocomplete="off"
      spellcheck="false"
      maxlength="20"
      placeholder="n"
      @input="emit('clearError')"
    />
  </label>
</template>

<script setup lang="ts">
defineProps<{ error: string; errorId: string }>()
const array = defineModel<string>('array', { required: true })
const target = defineModel<string>('target', { required: true })
const emit = defineEmits<{ clearError: [] }>()
</script>

<template>
  <label>
    <span class="algo-sr-only">Sorted array</span>
    <input
      v-model="array"
      aria-label="Sorted array"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      autocomplete="off"
      spellcheck="false"
      maxlength="512"
      placeholder="1, 3, 3, 5, 8"
      @input="emit('clearError')"
    />
  </label>
  <label class="integer-input target-field">
    <span class="algo-sr-only">Target</span>
    <input
      v-model="target"
      aria-label="Target"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      autocomplete="off"
      spellcheck="false"
      inputmode="numeric"
      maxlength="20"
      placeholder="Target"
      @input="emit('clearError')"
    />
  </label>
</template>

<style scoped>
.integer-input.target-field {
  flex: 0 0 86px;
}
</style>

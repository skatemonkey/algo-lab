<script setup lang="ts">
defineProps<{ label: string; placeholder?: string; error: string; errorId: string }>()
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ clearError: [] }>()
</script>

<template>
  <label>
    <span class="algo-sr-only">{{ label }}</span>
    <input
      v-model="model"
      :aria-label="label"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      autocomplete="off"
      spellcheck="false"
      maxlength="512"
      :placeholder="placeholder"
      @input="emit('clearError')"
    />
  </label>
</template>

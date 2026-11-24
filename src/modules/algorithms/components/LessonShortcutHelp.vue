<script setup lang="ts">
import { ref } from 'vue'
import { Keyboard } from '@lucide/vue'
import { useLessonKeyboard } from '../composables/useLessonKeyboard'

const { shortcuts } = useLessonKeyboard()
const disclosure = ref<HTMLDetailsElement | null>(null)
function close() {
  if (!disclosure.value?.open) return
  disclosure.value.open = false
  disclosure.value.querySelector('summary')?.focus()
}
</script>

<template>
  <details ref="disclosure" class="shortcut-help" @keydown.esc.stop.prevent="close">
    <summary aria-label="Keyboard shortcuts" title="Keyboard shortcuts">
      <Keyboard :size="17" aria-hidden="true" />
    </summary>
    <div class="shortcut-reference" role="note" aria-label="Keyboard shortcuts">
      <dl>
        <div v-for="shortcut in shortcuts" :key="shortcut.id">
          <dt>
            <kbd>{{ shortcut.keys }}</kbd>
          </dt>
          <dd>{{ shortcut.label }}</dd>
        </div>
      </dl>
    </div>
  </details>
</template>

<style scoped>
.shortcut-help {
  position: relative;
  flex-shrink: 0;
}
summary {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--algo-radius-sm);
  color: var(--algo-muted);
  cursor: pointer;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
summary:hover,
.shortcut-help[open] summary {
  color: var(--algo-ink);
  background: var(--algo-soft);
}
.shortcut-reference {
  position: absolute;
  z-index: 10;
  top: calc(100% + var(--algo-space-2));
  right: 0;
  padding: var(--algo-space-4);
  border: 1px solid var(--algo-line);
  border-radius: var(--algo-radius);
  background: var(--algo-paper);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--algo-ink) 6%, transparent);
  white-space: nowrap;
}
dl {
  display: grid;
  gap: var(--algo-space-3);
  margin: 0;
}
dl > div {
  display: grid;
  grid-template-columns: 15ch 1fr;
  gap: var(--algo-space-4);
  align-items: baseline;
  font-size: var(--algo-text-sm);
}
kbd {
  font: inherit;
  font-family: var(--algo-mono);
  color: var(--algo-ink);
}
dd {
  margin: 0;
  color: var(--algo-secondary);
}
</style>

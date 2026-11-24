<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RotateCcw } from '@lucide/vue'
import ArrayCopyMotion from './ArrayCopyMotion.vue'
import PointerSolutionRules from './PointerSolutionRules.vue'
import PointerSequence from './PointerSequence.vue'
import {
  arrayTransformVariables,
  pointerRuleStep,
  type ArrayTransformFrame,
} from '../domain/twoPointers'
import { removeDuplicatesRules } from '../lessons/twoPointers'

const props = defineProps<{
  frame: ArrayTransformFrame
  previousFrame: ArrayTransformFrame | null
  editing: boolean
  active: boolean
}>()
const emit = defineEmits<{ replay: [] }>()

// Use the trace's prior snapshot, including when seeking straight to a copy step.
const copying = ref(false)
const copyRun = ref(0)
const showCopy = computed(
  () =>
    props.active &&
    !props.editing &&
    props.frame.instruction === 'write' &&
    props.frame.left !== props.frame.right &&
    props.previousFrame?.instruction === 'left',
)

function playCopy() {
  copying.value = false
  if (!showCopy.value) return
  copyRun.value++
  copying.value = true
}

function replayCopy() {
  emit('replay')
  playCopy()
}

const activeStep = computed(() => {
  if (!props.active || props.editing) return undefined
  return pointerRuleStep(
    removeDuplicatesRules,
    props.frame.decision ?? null,
    props.frame.instruction,
  )
})
const pointers = computed(() =>
  arrayTransformVariables(props.frame).map((variable) => ({
    name: variable.name,
    index: Number(variable.value),
    updated: !!variable.updated,
    step: variable.name === props.frame.instruction ? activeStep.value : undefined,
  })),
)
const cellSteps = computed(() =>
  props.frame.instruction === 'write' && activeStep.value
    ? { [props.frame.left]: activeStep.value }
    : undefined,
)

watch([() => props.frame, () => props.active, () => props.editing], () => playCopy(), {
  immediate: true,
})
</script>

<template>
  <PointerSolutionRules
    :rules="removeDuplicatesRules"
    :outcome="frame.decision ?? null"
    :instruction="frame.instruction"
    :editing="editing"
  >
    <template #action-end="{ rule, index }">
      <button
        v-if="showCopy && rule.instructions?.[index] === 'write'"
        class="replay-copy"
        type="button"
        aria-label="Replay copy"
        title="Replay copy"
        @click="replayCopy"
      >
        <RotateCcw :size="13" aria-hidden="true" />
      </button>
    </template>
  </PointerSolutionRules>
  <PointerSequence
    class="duplicates-solution-array"
    :values="copying && previousFrame ? previousFrame.values : frame.values"
    :pointers="pointers"
    :prefix-length="copying && previousFrame ? previousFrame.prefixLength : frame.prefixLength"
    prefix-label="Unique prefix"
    :written="copying ? [] : frame.written"
    :highlighted="showCopy ? [frame.right] : []"
    :cell-steps="cellSteps"
    :active-step="activeStep"
    :complete="frame.instruction === 'return'"
    discard-tail
  >
    <template #overlay="{ position }">
      <ArrayCopyMotion
        v-if="showCopy"
        :from="position(frame.right)"
        :to="position(frame.left)"
        :value="frame.values[frame.right]!"
        :running="copying"
        :run="copyRun"
        @finish="copying = false"
      />
    </template>
  </PointerSequence>
</template>

<style scoped>
.duplicates-solution-array {
  min-height: 0;
  padding-top: var(--algo-space-2);
}
.replay-copy {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin: -2px 0 -2px var(--algo-space-1);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--algo-success-soft);
  color: var(--algo-success);
  cursor: pointer;
}
.replay-copy:hover {
  background: var(--algo-success-line);
}
</style>

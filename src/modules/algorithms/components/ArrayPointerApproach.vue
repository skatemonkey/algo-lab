<script setup lang="ts">
import { computed } from 'vue'
import PointerApproachLayout from './PointerApproachLayout.vue'
import PointerRuleExample from './PointerRuleExample.vue'
import type {
  ArrayTransformFrame,
  ArrayTransformInstruction,
  PointerApproach,
} from '../domain/twoPointers'

const props = defineProps<{
  approach: PointerApproach
  label: string
  compact?: boolean
  interactive?: boolean
  example: {
    values: readonly number[]
    cases: readonly {
      value: boolean
      right: number
      label: string
      actions?: readonly ArrayTransformInstruction[]
    }[]
  }
  trace: (values: readonly number[]) => readonly ArrayTransformFrame[]
}>()
const examples = computed(() => {
  const frames = props.trace(props.example.values)
  return new Map(
    props.example.cases.map((example) => {
      const index = frames.findIndex(
        (frame) => frame.instruction === 'condition' && frame.right === example.right,
      )
      return [
        example.value,
        {
          label: example.label,
          actions: example.actions,
          before: frames[index]!,
          after: frames.find(
            (frame, position) => position > index && frame.instruction === 'right',
          )!,
        },
      ]
    }),
  )
})
</script>

<template>
  <PointerApproachLayout
    :approach="approach"
    :label="label"
    :compact="compact"
    :interactive="interactive"
  >
    <template #default="{ rule, activeAction }">
      <PointerRuleExample
        :label="examples.get(rule.value)!.label"
        :before="examples.get(rule.value)!.before"
        :after="examples.get(rule.value)!.after"
        :compact="compact"
        :actions="examples.get(rule.value)!.actions"
        :action="
          activeAction === null ? undefined : examples.get(rule.value)!.actions?.[activeAction]
        "
      />
    </template>
  </PointerApproachLayout>
</template>

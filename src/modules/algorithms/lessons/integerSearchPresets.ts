import type {
  IntegerSearchExample,
  IntegerSearchMode,
  IntegerSearchPreset,
} from '../domain/integerSearch'

// A null lower-bound answer means the case is outside that question's guarantee.
const cases = [
  { label: 'Duplicates', values: [-4, 0, 0, 0, 5], target: 0, exact: 1, atLeast: 1 },
  { label: 'Target · first', values: [0, 3, 5, 8], target: 0, exact: 0, atLeast: 0 },
  { label: 'Target · last', values: [-5, -1, 2, 8], target: 8, exact: 3, atLeast: 3 },
  { label: 'Target · below all', values: [2, 4, 6], target: 1, exact: -1, atLeast: 0 },
  { label: 'Target · above all', values: [2, 4, 6], target: 7, exact: -1, atLeast: null },
  { label: 'All equal', values: [3, 3, 3, 3], target: 3, exact: 0, atLeast: 0 },
  { label: '1 item · match', values: [3], target: 3, exact: 0, atLeast: 0 },
  { label: '1 item · above target', values: [3], target: 2, exact: -1, atLeast: 0 },
  { label: '1 item · below target', values: [3], target: 4, exact: -1, atLeast: null },
  { label: '2 items · first', values: [2, 5], target: 2, exact: 0, atLeast: 0 },
  { label: '2 items · last', values: [2, 5], target: 5, exact: 1, atLeast: 1 },
  { label: '2 items · between', values: [2, 5], target: 3, exact: -1, atLeast: 1 },
  { label: 'Empty', values: [], target: 3, exact: -1, atLeast: null },
] as const

/** Keep problem examples at the top; offer focused cases only in the input selector. */
export function createIntegerSearchPresets(
  examples: readonly IntegerSearchExample[],
  mode: IntegerSearchMode,
): readonly IntegerSearchPreset[] {
  return [
    ...examples.map((example, index) => ({ ...example, label: `Example ${index + 1}` })),
    ...cases.flatMap(({ label, values, target, exact, atLeast }) => {
      const answer = mode === 'exact' ? exact : atLeast
      return answer === null ? [] : [{ label, values, target, answer }]
    }),
  ]
}

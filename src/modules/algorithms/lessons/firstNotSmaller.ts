import { createIntegerSearchPresets } from './integerSearchPresets'
import type { BoundarySearchApproach } from '../domain/searchPresentation'
import { firstNotSmallerPseudocode } from '../domain/integerSearch'
import type { IntegerSearchExample } from '../domain/integerSearch'
import type { LessonDefinition } from '../domain/lesson'

export const firstNotSmallerExamples = [
  { values: [1, 3, 3, 5, 8, 8, 10], target: 2, answer: 1 },
  { values: [2, 3, 5, 7, 11, 13, 17, 19], target: 6, answer: 3 },
] as const satisfies readonly IntegerSearchExample[]

export const firstNotSmallerPresets = createIntegerSearchPresets(
  firstNotSmallerExamples,
  'at-least',
)

export const firstNotSmallerLesson = {
  id: 'binary-search-first-not-smaller',
  problem: {
    title: 'Find the first element ≥ target',
    description:
      'Given a sorted integer array and a target, return the zero-based index of the first element greater than or equal to the target. A satisfying element is guaranteed to exist.',
    examples: firstNotSmallerExamples.map(({ values, target, answer }) => ({
      input: `arr = [${values.join(', ')}], target = ${target}`,
      output: String(answer),
    })),
    source: {
      label: 'AlgoMonster',
      url: 'https://algo.monster/problems/binary_search_first_element_not_smaller_than_target',
    },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description: 'Start with the full array. Set answer to −1 until a satisfying value is found.',
      instructions: ['bounds', 'answer'],
    },
    {
      id: 'compute',
      title: 'Compute the middle',
      description: 'While the range is nonempty, find its middle index. Round down.',
      instructions: ['loop', 'midpoint'],
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'The range is empty. Return the saved boundary.',
        },
      ],
    },
    {
      id: 'check',
      title: 'Check the middle',
      description:
        'Test A[mid] ≥ target. In sorted order, this is false before the boundary and true from it onward.',
      instructions: ['condition'],
      explanations: [
        {
          instruction: 'condition',
          outcome: true,
          text: 'This value is at least the target. Save its index, even if it is larger.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'This value is too small. The first satisfying value must be to its right.',
        },
      ],
    },
    {
      id: 'narrow',
      title: 'Narrow the range',
      description: 'If at least the target, save mid and search left. Otherwise search right.',
      instructions: ['save', 'right', 'else', 'left'],
      explanations: [
        {
          instruction: 'save',
          text: 'Save this candidate. An earlier value may also satisfy the test.',
        },
        {
          instruction: 'right',
          text: 'Search left for an earlier satisfying value. The candidate is saved.',
        },
        {
          instruction: 'left',
          text: 'Skip the midpoint and everything before it; they are all too small.',
        },
      ],
    },
    {
      id: 'finish',
      title: 'Return the answer',
      description:
        'Return the earliest index whose value is at least the target. An answer is guaranteed.',
      instructions: ['return'],
    },
  ],
  repeat: {
    from: 'compute',
    through: 'narrow',
    label: 'Repeat steps 2–4 until the range is empty.',
  },
  complexity: { time: 'O(log n)', space: 'O(1)' },
  pseudocode: firstNotSmallerPseudocode,
} as const satisfies LessonDefinition<(typeof firstNotSmallerPseudocode)[number]['id']>

export const firstNotSmallerApproach = {
  pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
  variation: 'Boundary search',
  target: 'First ≥ target',
  answerLabel: 'first ≥ target',
  regions: ['< target', '≥ target'],
  steps: [
    { id: 'split', title: 'Split', detail: '' },
    { id: 'search', title: 'Search', detail: 'Repeat until empty.' },
    { id: 'return', title: 'Return', detail: 'Saved index.' },
  ],
  cases: [
    { value: false, condition: '< target', action: 'Search right', direction: 'right' },
    {
      value: true,
      condition: '≥ target',
      action: 'Search left',
      direction: 'left',
      save: 'Save mid',
    },
  ],
} as const satisfies BoundarySearchApproach

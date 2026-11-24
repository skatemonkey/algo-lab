import { createIntegerSearchPresets } from './integerSearchPresets'
import type { BoundarySearchApproach } from '../domain/searchPresentation'
import { firstOccurrencePseudocode } from '../domain/integerSearch'
import type { IntegerSearchExample } from '../domain/integerSearch'
import type { LessonDefinition } from '../domain/lesson'

export const firstOccurrenceExamples = [
  { values: [1, 3, 3, 3, 3, 6, 10, 10, 10, 100], target: 3, answer: 1 },
  { values: [2, 3, 5, 7, 11, 13, 17, 19], target: 6, answer: -1 },
] as const satisfies readonly IntegerSearchExample[]

export const firstOccurrencePresets = createIntegerSearchPresets(firstOccurrenceExamples, 'exact')

export const firstOccurrenceLesson = {
  id: 'binary-search-first-occurrence',
  problem: {
    title: 'Find the first occurrence',
    description:
      'Given a sorted integer array and a target, return the zero-based index of its first occurrence, or −1 if the target is absent.',
    examples: firstOccurrenceExamples.map(({ values, target, answer }) => ({
      input: `arr = [${values.join(', ')}], target = ${target}`,
      output: String(answer),
    })),
    source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/binary_search_duplicates' },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description: 'Start with the full array. Set answer to −1 until an exact match is found.',
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
          text: 'The range is empty. Return the saved answer.',
        },
      ],
    },
    {
      id: 'check',
      title: 'Check the middle',
      description: 'Compare A[mid] with the target. Only an exact match can be saved.',
      instructions: ['condition'],
      explanations: [
        {
          instruction: 'condition',
          outcome: true,
          text: 'An exact match. Save it, then keep searching left for an earlier occurrence.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'No exact match. Check whether this value is smaller to choose the next half.',
        },
      ],
    },
    {
      id: 'narrow',
      title: 'Narrow the range',
      description:
        'If equal, save mid and search left. If smaller, search right. Otherwise search left.',
      instructions: ['save', 'right-match', 'smaller', 'left', 'else', 'right'],
      explanations: [
        { instruction: 'save', text: 'Save this exact match. It may not be the first occurrence.' },
        { instruction: 'right-match', text: 'The match is saved. Search left for an earlier one.' },
        {
          instruction: 'smaller',
          outcome: true,
          text: 'A[mid] is too small. The target can only be to its right.',
        },
        {
          instruction: 'smaller',
          outcome: false,
          text: 'A[mid] is larger than the target. Search left without saving it.',
        },
        {
          instruction: 'left',
          text: 'Skip the midpoint and everything before it; they are all too small.',
        },
        {
          instruction: 'right',
          text: 'Skip the midpoint and everything after it; they are all too large. Keep the saved answer.',
        },
      ],
    },
    {
      id: 'finish',
      title: 'Return the answer',
      description: 'Return the first matching index, or −1 if there was no exact match.',
      instructions: ['return'],
    },
  ],
  repeat: {
    from: 'compute',
    through: 'narrow',
    label: 'Repeat steps 2–4 until the range is empty.',
  },
  complexity: { time: 'O(log n)', space: 'O(1)' },
  pseudocode: firstOccurrencePseudocode,
} as const satisfies LessonDefinition<(typeof firstOccurrencePseudocode)[number]['id']>

export const firstOccurrenceApproach = {
  pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
  variation: 'Boundary search',
  target: 'First exact match',
  answerLabel: 'first match',
  regions: ['< target', '≥ target'],
  steps: [
    { id: 'split', title: 'Split', detail: '' },
    { id: 'search', title: 'Search', detail: 'Repeat until empty.' },
    { id: 'return', title: 'Return', detail: 'Saved index, or −1 if none.' },
  ],
  cases: [
    { value: false, condition: '< target', action: 'Search right', direction: 'right' },
    {
      value: true,
      condition: '≥ target',
      action: 'Search left',
      direction: 'left',
      save: 'Save if equal',
    },
  ],
} as const satisfies BoundarySearchApproach

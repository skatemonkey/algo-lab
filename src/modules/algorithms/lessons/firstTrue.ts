import { firstTruePseudocode } from '../domain/binarySearch'
import type { LessonDefinition } from '../domain/lesson'
import type { BoundarySearchApproach } from '../domain/searchPresentation'

export const firstTrueLesson = {
  id: 'binary-search-first-true',
  problem: {
    title: 'Find the first true',
    description:
      'Find the first true in a boolean array where all false values come before all true values. Return its zero-based index, or −1 if none exists.',
    examples: [{ input: '[false, false, true, true, true]', output: '2' }],
    source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/binary_search_boundary' },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description: 'Start with the full array. Set answer to −1 until a true is found.',
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
          text: 'The range is empty. Skip to step 5 and return the saved answer.',
        },
      ],
    },
    {
      id: 'check',
      title: 'Check the middle',
      description: 'Read A[mid] to choose which half to search next.',
      instructions: ['condition'],
      explanations: [
        {
          instruction: 'condition',
          outcome: true,
          text: 'A[mid] is true. It is a candidate; an earlier true may still exist.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'A[mid] is false. The first true, if it exists, must be to its right.',
        },
      ],
    },
    {
      id: 'narrow',
      title: 'Narrow the range',
      description: 'If true, save mid and search left. If false, search right.',
      instructions: ['save', 'right', 'else', 'left'],
      explanations: [
        { instruction: 'save', text: 'Save this match before moving the right bound.' },
        { instruction: 'right', text: 'Search left for an earlier true. The match is saved.' },
        { instruction: 'left', text: 'The midpoint is false. Skip it and search right.' },
      ],
    },
    {
      id: 'finish',
      title: 'Return the answer',
      description: 'Return the saved index, or −1 if no true was found.',
      instructions: ['return'],
    },
  ],
  repeat: {
    from: 'compute',
    through: 'narrow',
    label: 'Repeat steps 2–4 until the range is empty.',
  },
  pseudocode: firstTruePseudocode,
} as const satisfies LessonDefinition<(typeof firstTruePseudocode)[number]['id']>

export const firstTrueApproach = {
  pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
  variation: 'Boundary search',
  target: 'First true',
  answerLabel: 'first true',
  regions: ['false', 'true'],
  steps: [
    { id: 'split', title: 'Split', detail: '' },
    { id: 'search', title: 'Search', detail: 'Repeat until empty.' },
    { id: 'return', title: 'Return', detail: 'Saved index, or −1 if none.' },
  ],
  cases: [
    { value: false, condition: '== false', action: 'Search right', direction: 'right', save: '' },
    {
      value: true,
      condition: '== true',
      action: 'Search left',
      direction: 'left',
      save: 'Save mid',
    },
  ],
} as const satisfies BoundarySearchApproach

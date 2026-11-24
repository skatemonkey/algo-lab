import { mountainPeakPseudocode } from '../domain/mountainPeak'
import type { LessonDefinition } from '../domain/lesson'
import type { BoundarySearchApproach } from '../domain/searchPresentation'

export const mountainPeakExample = { values: [0, 1, 2, 3, 2, 1, 0], answer: 3 } as const

export const mountainPeakPresets = [
  { values: mountainPeakExample.values, label: 'Peak · middle' },
  { values: [0, 9, 7, 5, 3, 1], label: 'Peak · near start' },
  { values: [0, 2, 4, 6, 9, 1], label: 'Peak · near end' },
  { values: [0, 1, 0], label: '3 items' },
  { values: [-8, -3, -6, -9], label: 'Negative values' },
] as const

export const mountainPeakApproach = {
  pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
  variation: 'Boundary search',
  target: 'First falling pair.',
  answerLabel: 'peak',
  regions: ['Rising', 'Falling'],
  steps: [
    { id: 'split', title: 'Split', detail: '' },
    { id: 'search', title: 'Search', detail: '' },
    { id: 'return', title: 'Return', detail: 'Saved index.' },
  ],
  cases: [
    { value: false, condition: 'A[mid] < A[mid + 1]', action: 'Search right', direction: 'right' },
    {
      value: true,
      condition: 'A[mid] > A[mid + 1]',
      action: 'Search left',
      direction: 'left',
      save: 'Save mid',
    },
  ],
} as const satisfies BoundarySearchApproach

export const mountainPeakLesson: LessonDefinition = {
  id: 'binary-search-mountain-peak',
  problem: {
    title: 'The peak of a mountain array',
    description:
      'Given an array of at least three elements that strictly increases to a single peak, then strictly decreases, return the peak’s zero-based index. The peak is neither the first nor the last element.',
    examples: [{ input: '[0, 1, 2, 3, 2, 1, 0]', output: '3' }],
    sources: [
      { label: 'AlgoMonster', url: 'https://algo.monster/problems/peak_of_mountain_array' },
    ],
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      instructions: ['bounds', 'answer'],
      description: 'Search the whole array. Set answer to −1 until a falling pair is found.',
    },
    {
      id: 'compute',
      title: 'Compute the middle',
      instructions: ['loop', 'midpoint'],
      description:
        'While left ≤ right, round the midpoint down. With two neighbors left, this chooses the left one.',
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'The range is empty. The saved index is where the falling slope begins.',
        },
      ],
    },
    {
      id: 'check',
      title: 'Check the slope',
      instructions: ['condition'],
      description: 'Compare A[mid] with A[mid + 1]. A falling pair starts at or after the peak.',
      explanations: [
        {
          instruction: 'condition',
          outcome: true,
          text: 'The slope falls. Save mid, then look left for an earlier falling pair.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'The slope rises. The peak is strictly to the right of mid.',
        },
      ],
    },
    {
      id: 'narrow',
      title: 'Narrow the range',
      instructions: ['save', 'right', 'else', 'left'],
      description: 'Falling: save mid and move right to mid − 1. Rising: move left to mid + 1.',
      explanations: [
        {
          instruction: 'save',
          text: 'Save this candidate before moving the bound. It may be the peak or lie on the descent.',
        },
        {
          instruction: 'right',
          text: 'The candidate is saved. Search before it for the first falling pair.',
        },
        {
          instruction: 'left',
          text: 'Discard mid and everything before it. The peak is farther right.',
        },
      ],
    },
    {
      id: 'finish',
      title: 'Return the peak',
      instructions: ['return'],
      description: 'Return the saved index, where the slope first changes from rising to falling.',
    },
  ],
  repeat: {
    from: 'compute',
    through: 'narrow',
    label: 'Repeat steps 2–4 until the range is empty.',
  },
  complexity: { time: 'O(log n)', space: 'O(1)' },
  notes: [
    {
      title: 'A rising slope, then a falling slope',
      text: 'A[mid] > A[mid + 1] is false before the peak and true from the peak through the second-last index. Find the first true. Values can repeat across opposite sides of the mountain, but each side must be strict.',
    },
    {
      title: 'Why the right neighbor is safe',
      text: 'Floor division picks the left index of a two-element range: [0, 1] gives 0, and [4, 5] gives 4. A valid mountain ends by falling, so index n − 2 always sends the search left. The search never reaches n − 1, even when right initially includes it. Starting right at n − 2 also works.',
    },
    {
      title: 'The left-neighbor trap',
      text: 'When [0, 1] remains, mid is 0. In Python, A[mid − 1] then means A[−1], the last value, so a copied left-neighbor test may skip the peak. The right-neighbor test starts with the guaranteed rising first pair.',
    },
    {
      title: 'Complexity',
      text: 'The binary search takes O(log n) time and O(1) auxiliary space. The interactive tool separately validates the input and stores playback snapshots; those are visualization costs.',
    },
  ],
  pseudocode: mountainPeakPseudocode(),
}

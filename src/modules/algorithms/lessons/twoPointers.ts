import {
  linkedListMiddlePseudocode,
  moveZerosPseudocode,
  removeDuplicatesPseudocode,
  type PointerApproach,
} from '../domain/twoPointers'
import type { LessonDefinition } from '../domain/lesson'

export const removeDuplicatesRules = [
  {
    value: true,
    condition: 'A[right] ≠ A[left]',
    actions: ['Advance left', 'Copy value', 'Advance right'],
    instructions: ['left', 'write', 'right'],
  },
  {
    value: false,
    condition: 'A[right] = A[left]',
    actions: ['Advance right'],
    instructions: ['right'],
  },
] as const

export const removeDuplicatesExample = {
  values: [1, 1, 2, 3],
  cases: [
    { value: true, right: 2, label: 'New value', actions: removeDuplicatesRules[0].instructions },
    { value: false, right: 1, label: 'Duplicate', actions: removeDuplicatesRules[1].instructions },
  ],
} as const

export const removeDuplicatesApproach = {
  pattern: { label: 'Two pointers' },
  variation: 'Same direction',
  roles: [
    { name: 'left', initial: 0, description: 'Last kept position' },
    { name: 'right', initial: 0, description: 'Scan position' },
  ],
  rules: removeDuplicatesRules,
  result: 'left + 1',
  resultDescription: 'Unique count',
} as const satisfies PointerApproach

export const moveZerosRules = [
  {
    value: true,
    condition: 'A[right] ≠ 0',
    actions: ['Swap values', 'Advance left', 'Advance right'],
    instructions: ['swap', 'left', 'right'],
  },
  {
    value: false,
    condition: 'A[right] = 0',
    actions: ['Advance right'],
    instructions: ['right'],
  },
] as const

export const moveZerosApproach = {
  pattern: { label: 'Two pointers' },
  variation: 'Same direction',
  roles: [
    { name: 'left', initial: 0, description: 'Next nonzero destination' },
    { name: 'right', initial: 0, description: 'Scan position' },
  ],
  rules: moveZerosRules,
  result: 'A',
  resultDescription: 'Updated array',
} as const satisfies PointerApproach

export const moveZerosExample = {
  values: [0, 0, 2, 3],
  cases: [
    { value: true, right: 2, label: 'Nonzero value', actions: moveZerosRules[0].instructions },
    { value: false, right: 1, label: 'Zero', actions: moveZerosRules[1].instructions },
  ],
} as const

export const linkedListMiddleRules = [
  {
    value: true,
    condition: 'fast ≠ null and fast.next ≠ null',
    actions: ['Advance slow 1 node', 'Advance fast 2 nodes'],
    instructions: ['slow', 'fast'],
  },
  {
    value: false,
    condition: 'fast = null or fast.next = null',
    actions: ['Return slow'],
    instructions: ['return'],
  },
] as const

export const linkedListMiddleApproach = {
  pattern: { label: 'Two pointers' },
  variation: 'Same direction',
  technique: 'Fast and slow pointers',
  roles: [
    { name: 'slow', initial: 'head', description: 'Middle candidate' },
    { name: 'fast', initial: 'head', description: 'Scan position' },
  ],
  rules: linkedListMiddleRules,
  result: 'slow',
  resultDescription: 'Middle node',
} as const satisfies PointerApproach & { technique: string }

export const linkedListMiddleExamples = {
  advance: [0, 1, 2],
  endings: [
    { label: 'Odd length', values: [0, 1, 2] },
    { label: 'Even length', values: [0, 1, 2, 3] },
  ],
} as const

export const removeDuplicatesPresets = [
  { label: 'Example 1', values: [0, 0, 1, 1, 1, 2, 2] },
  { label: 'All the same', values: [2, 2, 2, 2] },
  { label: 'All unique', values: [1, 2, 3, 4] },
  { label: 'Single element', values: [7] },
] as const

export const removeDuplicatesLesson = {
  id: 'two-pointers-remove-duplicates',
  problem: {
    title: 'Remove duplicates',
    description:
      'Given a nonempty sorted integer array, keep each distinct value once at the front, in order. Modify the array in place and return the number of unique values. Ignore the remaining positions.',
    examples: [{ input: 'arr = [0, 0, 1, 1, 1, 2, 2]', output: '3 · prefix [0, 1, 2]' }],
    source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/remove_duplicates' },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description: 'Keep the first value. Left marks the last unique value; right scans the array.',
      instructions: ['initialize'],
    },
    {
      id: 'check',
      title: 'Check the value',
      description: 'Compare the current value with the last unique value.',
      instructions: ['loop', 'condition'],
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'Right has passed the array. All values have been checked.',
        },
        { instruction: 'condition', outcome: true, text: 'A new value. Extend the unique prefix.' },
        { instruction: 'condition', outcome: false, text: 'Already kept this value. Skip it.' },
      ],
    },
    {
      id: 'keep',
      title: 'Keep it',
      description: 'Advance left, then copy the new value into that position.',
      instructions: ['left', 'write'],
    },
    {
      id: 'advance',
      title: 'Move right',
      description: 'Advance right to check the next value.',
      instructions: ['right'],
    },
    {
      id: 'finish',
      title: 'Return the length',
      description: 'The unique prefix ends at left, so its length is left + 1.',
      instructions: ['return'],
    },
  ],
  repeat: { from: 'check', through: 'advance', label: 'Repeat steps 2–4 until right reaches n.' },
  complexity: { time: 'O(n)', space: 'O(1)' },
  pseudocode: removeDuplicatesPseudocode,
} as const satisfies LessonDefinition<(typeof removeDuplicatesPseudocode)[number]['id']>

export const linkedListMiddlePresets = [
  { label: 'Example 1', values: [0, 1, 2, 3, 4] },
  { label: 'Example 2', values: [0, 1, 2, 3, 4, 5] },
  { label: 'Single node', values: [7] },
  { label: 'Two nodes', values: [10, 20] },
  { label: 'Repeated values', values: [5, 5, 5, 5] },
] as const

export const linkedListMiddleLesson = {
  id: 'two-pointers-linked-list-middle',
  problem: {
    title: 'Middle of a linked list',
    description:
      'Return the middle node’s value in a nonempty singly linked list. If there are two middle nodes, choose the second.',
    examples: [
      { input: '0 → 1 → 2 → 3 → 4', output: '2' },
      { input: '0 → 1 → 2 → 3 → 4 → 5', output: '3' },
    ],
    source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/middle_of_linked_list' },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Start at head',
      description: 'Both pointers start at the first node.',
      instructions: ['initialize'],
    },
    {
      id: 'check',
      title: 'Check ahead',
      description: 'Continue while fast and its next node exist.',
      instructions: ['loop'],
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'Fast reached the last node or null. Slow is at the middle.',
        },
      ],
    },
    {
      id: 'slow',
      title: 'Move slow',
      description: 'Follow one next link.',
      instructions: ['slow'],
    },
    {
      id: 'fast',
      title: 'Move fast',
      description: 'Follow two next links. Fast moves twice as far as slow.',
      instructions: ['fast'],
    },
    {
      id: 'finish',
      title: 'Return the middle',
      description: 'Return slow’s value. For an even length, slow reaches the second middle node.',
      instructions: ['return'],
    },
  ],
  repeat: {
    from: 'check',
    through: 'fast',
    label: 'Repeat steps 2–4 while fast and fast.next exist.',
  },
  complexity: { time: 'O(n)', space: 'O(1)' },
  pseudocode: linkedListMiddlePseudocode,
} as const satisfies LessonDefinition<(typeof linkedListMiddlePseudocode)[number]['id']>

export const moveZerosPresets = [
  { label: 'Example 1', values: [1, 0, 2, 0, 0, 7] },
  { label: 'All zeros', values: [0, 0, 0, 0] },
  { label: 'No zeros', values: [1, 2, 3, 4] },
  { label: 'Leading zeros', values: [0, 0, 3, 1, 2] },
  { label: 'Empty array', values: [] },
] as const

export const moveZerosLesson = {
  id: 'two-pointers-move-zeros',
  problem: {
    title: 'Move zeros',
    description:
      'Move all zeros to the end of an integer array in place, preserving the order of nonzero values. Use constant extra space.',
    examples: [{ input: 'arr = [1, 0, 2, 0, 0, 7]', output: '[1, 2, 7, 0, 0, 0]' }],
    source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/move_zeros' },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description: 'Left marks the next nonzero position; right scans the array.',
      instructions: ['initialize'],
    },
    {
      id: 'check',
      title: 'Check the value',
      description: 'Keep nonzero values and skip zeros.',
      instructions: ['loop', 'condition'],
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'Right has passed the array. Every nonzero value is at the front.',
        },
        {
          instruction: 'condition',
          outcome: true,
          text: 'A nonzero value. Move it to the next position at the front.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'A zero. Leave left in place and keep scanning.',
        },
      ],
    },
    {
      id: 'move',
      title: 'Move it forward',
      description:
        'Swap with A[left], then advance left. Swapping a value with itself is harmless.',
      instructions: ['swap', 'left'],
    },
    {
      id: 'advance',
      title: 'Move right',
      description: 'Advance right to check the next value.',
      instructions: ['right'],
    },
    {
      id: 'finish',
      title: 'Finish',
      description: 'The array is updated in place. No return value is needed.',
      instructions: ['return'],
    },
  ],
  repeat: { from: 'check', through: 'advance', label: 'Repeat steps 2–4 until right reaches n.' },
  complexity: { time: 'O(n)', space: 'O(1)' },
  pseudocode: moveZerosPseudocode,
} as const satisfies LessonDefinition<(typeof moveZerosPseudocode)[number]['id']>

export const rotatedMinimumReasoningStages = [
  {
    id: 'shape',
    label: 'Overall shape',
    title: 'Rise, drop, rise',
    description: 'Target: the minimum’s index, where the lower run starts.',
  },
  {
    id: 'neighbors',
    label: 'Why not neighbors?',
    title: 'Why comparing neighbors is not enough',
    description: 'A rising pair can lie on either side of the target.',
  },
  {
    id: 'fixed-last',
    label: 'Fixed last element',
    title: 'Why compare with the fixed last element?',
    description: 'A[−1] separates the two runs. It stays fixed as the search narrows.',
  },
  {
    id: 'equality',
    label: 'Why include =?',
    title: 'Why include equality?',
    description: 'If the target is the last index:',
    points: [
      'mid eventually reaches it, so A[mid] = A[−1].',
      '≤ saves the target; < rejects it.',
    ],
  },
] as const

// Each run has a rising pair, making the neighbor counterexample visible at a glance.
export const rotatedReasoningExample = {
  values: [30, 40, 50, 5, 10, 20],
  minimum: 3,
  pairs: [
    { left: 0, right: 1, result: 'Target is to the right' },
    { left: 4, right: 5, result: 'Target is to the left' },
  ],
} as const

export const rotatedEqualityExample = {
  values: [3, 5, 7, 11, 13, 17, 19, 2],
  minimum: 7,
} as const

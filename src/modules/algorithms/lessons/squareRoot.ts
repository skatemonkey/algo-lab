import { squareRootPseudocode, type SquareRootApproach } from '../domain/squareRoot'
import type { LessonDefinition } from '../domain/lesson'
import type { BoundarySearchApproach } from '../domain/searchPresentation'

export const squareRootExamples = [
  { n: 16, answer: 4 },
  { n: 8, answer: 2 },
] as const

export const squareRootPresets = [0, 1, 2, 8, 9, 10, 16, 1000].map((n) => ({
  n,
  label: `n = ${n}`,
}))

const problem = {
  title: 'Find the integer square root',
  description:
    'Given a non-negative integer n, return the integer part of its square root without using a built-in square-root function. Discard any decimal portion.',
  examples: squareRootExamples.map(({ n, answer }) => ({
    input: 'n = ' + n,
    output: String(answer),
  })),
  source: { label: 'AlgoMonster', url: 'https://algo.monster/problems/sqrt' },
}

const notes = [
  {
    title: 'Search numbers, not indices',
    text: 'The candidates are the integers from 0 through n. No input array exists. The lower-boundary approach finds the largest candidate whose square does not exceed n; the upper-boundary approach finds the smallest candidate whose square reaches or exceeds n.',
  },
  {
    title: 'The midpoint rounds down',
    text: 'mid = (left + right) // 2 selects the lower of two neighbors: [2, 3] gives 2, and [4, 5] gives 4. After saving a candidate, move past mid with mid + 1 or mid − 1 so the search keeps making progress.',
  },
  {
    title: 'Both boundaries give the integer part',
    text: '√8 ≈ 2.828, so return 2. The lower approach saves 2 directly. The upper approach saves 3, checks that 3² is not 8, then returns 3 − 1. For a perfect square such as 16, both return 4 without adjustment.',
  },
  {
    title: 'Complexity',
    text: 'For input n, each iteration roughly halves the candidate range: O(log n) time and O(1) auxiliary space for either solution. Zero and one take constant time. Playback snapshots are extra visualization storage, not part of the algorithm’s working space.',
  },
] as const

const solutions = [
  {
    title: 'Lower boundary',
    code: `def square_root(n: int) -> int:
    left, right = 0, n
    answer = 0

    while left <= right:
        mid = (left + right) // 2
        square = mid * mid

        if square <= n:
            answer = mid
            left = mid + 1
        else:
            right = mid - 1

    return answer`,
  },
  {
    title: 'Upper boundary',
    code: `def square_root(n: int) -> int:
    left, right = 0, n
    boundary = 0

    while left <= right:
        mid = (left + right) // 2
        square = mid * mid

        if square >= n:
            boundary = mid
            right = mid - 1
        else:
            left = mid + 1

    return boundary if boundary * boundary == n else boundary - 1`,
  },
] as const

function createLesson(approach: SquareRootApproach): LessonDefinition {
  const lower = approach === 'lower'
  return {
    id: 'binary-search-square-root',
    problem,
    steps: [
      {
        id: 'initialize',
        title: 'Initialize',
        description:
          'Search the candidate numbers from 0 through n. Initialize the saved candidate to 0.',
        instructions: ['bounds', 'answer'],
      },
      {
        id: 'compute',
        title: 'Compute the middle',
        description:
          'While left ≤ right, choose the midpoint rounded down, then compute its square.',
        instructions: ['loop', 'midpoint', 'square'],
        explanations: [
          {
            instruction: 'loop',
            outcome: false,
            text: lower
              ? 'The range is empty. The saved candidate is the largest valid integer.'
              : 'The range is empty. Check whether the saved upper boundary is exact.',
          },
          {
            instruction: 'midpoint',
            text: 'Choose the lower middle candidate. Compute its square in the next statement.',
          },
        ],
      },
      {
        id: 'check',
        title: 'Check the square',
        description: lower
          ? 'Test square ≤ n. A true result means this candidate is small enough.'
          : 'Test square ≥ n. A true result means this candidate reaches or exceeds the root.',
        instructions: ['condition'],
        explanations: [
          {
            instruction: 'condition',
            outcome: true,
            text: lower
              ? 'Save this candidate, then search right for a larger valid number.'
              : 'Save this candidate, then search left for a smaller upper boundary.',
          },
          {
            instruction: 'condition',
            outcome: false,
            text: lower
              ? 'The square is too large. Search left without saving this candidate.'
              : 'The square is too small. Search right without saving this candidate.',
          },
        ],
      },
      {
        id: 'narrow',
        title: 'Narrow the range',
        description: lower
          ? 'If square ≤ n, save mid and search right. Otherwise search left.'
          : 'If square ≥ n, save mid and search left. Otherwise search right.',
        instructions: ['save', 'left', 'else', 'right'],
        explanations: [
          {
            instruction: 'save',
            text: 'Save mid first. The search bounds move in the next statement.',
          },
          { instruction: 'left', text: 'Move left past mid. Every remaining candidate is larger.' },
          {
            instruction: 'right',
            text: 'Move right before mid. Every remaining candidate is smaller.',
          },
        ],
      },
      {
        id: 'finish',
        title: lower ? 'Return the answer' : 'Adjust if needed',
        description: lower
          ? 'Return the largest saved candidate whose square is at most n.'
          : 'Return the saved boundary if its square equals n. Otherwise subtract one to discard the decimal portion.',
        instructions: lower ? ['return'] : ['result', 'exact', 'adjust', 'return'],
        explanations: lower
          ? []
          : [
              {
                instruction: 'exact',
                outcome: false,
                text: 'The boundary is exact. Keep it as the answer; no subtraction is needed.',
              },
              {
                instruction: 'exact',
                outcome: true,
                text: 'The boundary is above the square root. Subtract one in the next statement.',
              },
              {
                instruction: 'adjust',
                text: 'Keep the saved boundary visible and return boundary − 1 as the integer square root.',
              },
            ],
      },
    ],
    repeat: {
      from: 'compute',
      through: 'narrow',
      label: 'Repeat steps 2–4 until the range is empty.',
    },
    complexity: { time: 'O(log n)', space: 'O(1)' },
    pseudocode: squareRootPseudocode[approach],
    notes,
    solutions,
  }
}

export const squareRootLessons = { lower: createLesson('lower'), upper: createLesson('upper') }

export const squareRootApproaches = {
  lower: {
    pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
    variation: 'Search on answer → Boundary search',
    target: 'Last candidate whose square is at most n',
    answerLabel: 'last match',
    targetRegion: 0,
    regions: ['candidate² ≤ n', 'candidate² > n'],
    steps: [
      { id: 'split', title: 'Split', detail: '' },
      { id: 'search', title: 'Search', detail: 'Repeat until empty.' },
      { id: 'return', title: 'Return', detail: 'Saved candidate.' },
    ],
    cases: [
      {
        value: true,
        condition: 'mid² ≤ n',
        save: 'Save mid',
        action: 'Search right',
        direction: 'right',
      },
      { value: false, condition: 'mid² > n', action: 'Search left', direction: 'left' },
    ],
  },
  upper: {
    pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
    variation: 'Search on answer → Boundary search',
    target: 'First candidate whose square is at least n',
    answerLabel: 'first match',
    targetRegion: 1,
    regions: ['candidate² < n', 'candidate² ≥ n'],
    steps: [
      { id: 'split', title: 'Split', detail: '' },
      { id: 'search', title: 'Search', detail: 'Repeat until empty.' },
      { id: 'return', title: 'Return', detail: 'Saved candidate; subtract 1 if not exact.' },
    ],
    cases: [
      { value: false, condition: 'mid² < n', action: 'Search right', direction: 'right' },
      {
        value: true,
        condition: 'mid² ≥ n',
        save: 'Save mid',
        action: 'Search left',
        direction: 'left',
      },
    ],
  },
} as const satisfies Record<SquareRootApproach, BoundarySearchApproach>

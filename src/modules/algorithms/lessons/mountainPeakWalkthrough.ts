import { traceMountainPeak } from '../domain/mountainPeak'

export const mountainPeakReasoningStages = [
  {
    id: 'midpoint',
    label: 'Midpoint rule',
    title: 'Round down',
    description: 'With two neighboring indices, mid is always left.',
  },
  {
    id: 'endpoints',
    label: 'Mountain endpoints',
    title: 'Check the endpoints',
    description: 'A valid mountain starts by rising and ends by falling.',
  },
  {
    id: 'left-neighbor',
    label: 'Left-neighbor failure',
    title: 'Why the left-neighbor attempt fails',
    description: 'mid can reach index 0, which has no left neighbor.',
  },
  {
    id: 'right-neighbor',
    label: 'Right-neighbor solution',
    title: 'Why the right neighbor works',
    description: 'mid never reaches the last index, so mid + 1 stays inside the array.',
  },
] as const

export const midpointRuleExample = { left: 0, right: 1 } as const

export const leftNeighborCounterexample = [0, 5, 4, 3, 2, 1] as const

// Deliberately demonstrate the failed left-neighbor attempt with Python's negative indexing.
// The correct search and its playback remain in domain/mountainPeak.ts.
function buildFailedAttempt(values: readonly number[]) {
  let left = 0
  let right = values.length - 1
  let answer = -1
  const frames: {
    left: number
    right: number
    mid: number
    neighbor: number
    rising: boolean
    nextLeft: number
    nextRight: number
    answer: number
    done: boolean
  }[] = []
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const neighbor = mid === 0 ? values.length - 1 : mid - 1
    const rising = values[mid]! > values[neighbor]!
    const nextLeft = rising ? mid + 1 : left
    const nextRight = rising ? right : mid - 1
    if (rising) answer = mid
    frames.push({ left, right, mid, neighbor, rising, nextLeft, nextRight, answer, done: false })
    left = nextLeft
    right = nextRight
  }
  frames.push({ ...frames[frames.length - 1]!, left, right, done: true })
  return frames
}

const failedAttempt = buildFailedAttempt(leftNeighborCounterexample)
const failure = failedAttempt.find((frame) => frame.mid === 0 && !frame.done)!
const result = failedAttempt[failedAttempt.length - 1]!
const peak = leftNeighborCounterexample.findIndex(
  (value) => value === Math.max(...leftNeighborCounterexample),
)

function explainPair(left: number, right: number, length: number) {
  const mid = Math.floor((left + right) / 2)
  return [
    {
      title:
        left === 0
          ? 'Reach the left edge'
          : right === length - 1
            ? 'Reach the right edge'
            : 'Inspect a pair',
      expressions: [`left = ${left}, right = ${right}`],
      detail: 'Two indices remain.',
      tone: 'neutral',
    },
    {
      title: 'Compute the midpoint',
      expressions: [`mid = floor((${left} + ${right}) / 2)`, `    = ${mid}`],
      detail: 'Round down: mid is left.',
      tone: 'accent',
    },
  ] as const
}

export const leftNeighborFailure = {
  values: leftNeighborCounterexample,
  frame: failure,
  comparison: {
    formula: 'A[mid] > A[mid − 1]',
    comparison: `${leftNeighborCounterexample[failure.mid]} > ${leftNeighborCounterexample[failure.neighbor]}`,
    result: `${failure.rising} · wrong neighbor`,
    tone: 'error',
  },
  explanation: [
    ...explainPair(failure.left, failure.right, leftNeighborCounterexample.length),
    {
      title: 'Read the left neighbor',
      expressions: [`mid − 1 = ${failure.mid} − 1`, '        = −1'],
      detail: 'Python: A[−1] reads the last value.',
      tone: 'error',
    },
    {
      title: 'Update the range',
      expressions: [
        `${leftNeighborCounterexample[failure.mid]} > ${leftNeighborCounterexample[failure.neighbor]} → ${failure.rising}`,
        `right ← ${failure.nextRight}`,
      ],
      detail: `Return ${result.answer}; peak at index ${peak} is skipped.`,
      tone: 'error',
    },
  ],
} as const

const rightNeighborValues = [0, 1, 2, 3, 4, 5, 6, 0] as const
const rightEdge = traceMountainPeak(rightNeighborValues).find(
  (frame) =>
    frame.instruction === 'condition' &&
    frame.left === rightNeighborValues.length - 2 &&
    frame.right === rightNeighborValues.length - 1,
)!
const rightMid = rightEdge.mid!

export const rightNeighborSolution = {
  values: rightNeighborValues,
  left: rightEdge.left,
  right: rightEdge.right,
  mid: rightMid,
  neighbor: rightMid + 1,
  comparison: {
    formula: 'A[mid] > A[mid + 1]',
    comparison: `${rightNeighborValues[rightMid]} > ${rightNeighborValues[rightMid + 1]}`,
    result: 'Falling',
    direction: 'falling',
  },
  explanation: [
    ...explainPair(rightEdge.left, rightEdge.right, rightNeighborValues.length),
    {
      title: 'Read the right neighbor',
      expressions: [`mid + 1 = ${rightMid} + 1`, `        = ${rightMid + 1}`],
      detail: 'Still inside the array.',
      tone: 'success',
    },
    {
      title: 'Update the range',
      expressions: [`answer ← ${rightMid}`, `right ← ${rightMid - 1}`],
      detail: 'The last pair falls, so search left.',
      tone: 'success',
    },
  ],
} as const

import { traceSquareRoot } from '../domain/squareRoot'

export const squareRootReasoningStages = [
  {
    id: 'midpoint',
    label: 'Midpoint rule',
    title: 'Round down',
    description: 'With two neighboring candidates, mid is always the lower one.',
  },
  {
    id: 'required',
    label: 'Required result',
    title: 'Return the integer part',
    description: 'Discard the decimal portion.',
  },
  {
    id: 'lower',
    label: 'Lower candidate',
    title: 'Keep the largest valid candidate',
    description: 'Search integers from 0 through n. No input array is needed.',
  },
  {
    id: 'upper',
    label: 'Upper candidate',
    title: 'Keep the smallest upper candidate',
    description: 'Return the saved candidate if exact; otherwise, subtract 1.',
  },
  {
    id: 'example',
    label: 'Example · n = 8',
    title: 'Same answer, different saved candidates',
  },
] as const

const n = 8
const lower = traceSquareRoot(n, 'lower').at(-1)!
const upper = traceSquareRoot(n, 'upper').at(-1)!

export const squareRootReasoningExample = {
  n,
  candidates: Array.from({ length: n + 1 }, (_, candidate) => candidate),
  pairStart: 2,
  lower: lower.answer!,
  upper: upper.answer!,
  result: lower.result!,
  // A continuous position for the teaching diagram, separate from the search implementation.
  root: Math.sqrt(n),
} as const

import type { SearchFrame } from './binarySearch'

export type SquareRootApproach = 'lower' | 'upper'

export const squareRootPseudocode = {
  lower: [
    { id: 'bounds', text: 'left ← 0, right ← n', indent: 0 },
    { id: 'answer', text: 'answer ← 0', indent: 0 },
    { id: 'loop', text: 'while left ≤ right', indent: 0 },
    { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
    { id: 'square', text: 'square ← mid × mid', indent: 1 },
    { id: 'condition', text: 'if square ≤ n', indent: 1 },
    { id: 'save', text: 'answer ← mid', indent: 2 },
    { id: 'left', text: 'left ← mid + 1', indent: 2 },
    { id: 'else', text: 'else', indent: 1 },
    { id: 'right', text: 'right ← mid − 1', indent: 2 },
    { id: 'return', text: 'return answer', indent: 0 },
  ],
  upper: [
    { id: 'bounds', text: 'left ← 0, right ← n', indent: 0 },
    { id: 'answer', text: 'boundary ← 0', indent: 0 },
    { id: 'loop', text: 'while left ≤ right', indent: 0 },
    { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
    { id: 'square', text: 'square ← mid × mid', indent: 1 },
    { id: 'condition', text: 'if square ≥ n', indent: 1 },
    { id: 'save', text: 'boundary ← mid', indent: 2 },
    { id: 'right', text: 'right ← mid − 1', indent: 2 },
    { id: 'else', text: 'else', indent: 1 },
    { id: 'left', text: 'left ← mid + 1', indent: 2 },
    { id: 'result', text: 'answer ← boundary', indent: 0 },
    { id: 'exact', text: 'if boundary × boundary ≠ n', indent: 0 },
    { id: 'adjust', text: 'answer ← boundary − 1', indent: 1 },
    { id: 'return', text: 'return answer', indent: 0 },
  ],
} as const

export type SquareRootInstruction = Exclude<
  (typeof squareRootPseudocode)[SquareRootApproach][number]['id'],
  'else'
>
export interface SquareRootFrame extends SearchFrame<SquareRootInstruction> {
  square: bigint | null
  result: number | null
}

export function parseSquareRootInput(text: string): number {
  if (!/^\+?\d+$/.test(text.trim())) throw new RangeError('Enter a non-negative whole number.')
  const n = Number(text)
  validateInput(n)
  return n
}

function validateInput(n: number) {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError('Use a whole number from 0 through 9,007,199,254,740,991.')
  }
}

/** Search numeric candidates without creating an array or using a square-root function. */
export function traceSquareRoot(n: number, approach: SquareRootApproach): SquareRootFrame[] {
  validateInput(n)
  let left = 0
  let right = n
  let mid: number | null = null
  let square: bigint | null = null
  let answer: number | null = null
  let result: number | null = null
  let comparisons = 0
  const target = BigInt(n)
  const frames: SquareRootFrame[] = []
  const add = (instruction: SquareRootInstruction, outcome: boolean | null = null) => {
    frames.push({ instruction, left, right, mid, square, answer, result, comparisons, outcome })
  }

  add('bounds')
  answer = 0
  add('answer')
  while (true) {
    add('loop', left <= right)
    if (left > right) break
    mid = left + Math.floor((right - left) / 2)
    add('midpoint')
    // Exact multiplication also keeps very large input demonstrations accurate.
    square = BigInt(mid) * BigInt(mid)
    add('square')
    const matches = approach === 'lower' ? square <= target : square >= target
    comparisons++
    add('condition', matches)
    if (matches) {
      answer = mid
      add('save')
    }
    if ((approach === 'lower' && matches) || (approach === 'upper' && !matches)) {
      left = mid + 1
      add('left')
    } else {
      right = mid - 1
      add('right')
    }
  }
  result = answer
  if (approach === 'upper') {
    add('result')
    const needsAdjustment = BigInt(answer) * BigInt(answer) !== target
    add('exact', needsAdjustment)
    if (needsAdjustment) {
      result = answer - 1
      add('adjust')
    }
  }
  add('return')
  return frames
}

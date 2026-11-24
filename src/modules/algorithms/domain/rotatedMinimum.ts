import type { SearchFrame } from './binarySearch'

export const rotatedMinimumPseudocode = [
  { id: 'bounds', text: 'left ← 0, right ← length(A) − 1', indent: 0 },
  { id: 'answer', text: 'answer ← −1', indent: 0 },
  { id: 'loop', text: 'while left ≤ right', indent: 0 },
  { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
  { id: 'condition', text: 'if A[mid] ≤ A[−1]', indent: 1 },
  { id: 'save', text: 'answer ← mid', indent: 2 },
  { id: 'right', text: 'right ← mid − 1', indent: 2 },
  { id: 'else', text: 'else', indent: 1 },
  { id: 'left', text: 'left ← mid + 1', indent: 2 },
  { id: 'return', text: 'return answer', indent: 0 },
] as const

export type RotatedMinimumFrame = SearchFrame<
  Exclude<(typeof rotatedMinimumPseudocode)[number]['id'], 'else'>
>

function validateInput(values: readonly number[]) {
  if (values.length === 0) throw new RangeError('Enter a non-empty array.')
  if (values.some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError('Use whole numbers within the safe integer range.')
  }
  // A strictly increasing cycle has one descent, including its wraparound.
  let drops = 0
  for (let index = 0; values.length > 1 && index < values.length; index++) {
    const current = values[index]!
    const next = values[(index + 1) % values.length]!
    if (current === next) throw new RangeError('Use unique integers; duplicates are not allowed.')
    if (current > next) drops++
  }
  if (drops > 1) {
    throw new RangeError('Use a sorted array of unique integers, optionally rotated at one pivot.')
  }
}

export function parseRotatedMinimumInput(arrayText: string): number[] {
  let text = arrayText.trim()
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1).trim()
  const tokens = text ? (text.includes(',') ? text.split(',') : text.split(/\s+/)) : []
  if (!tokens.every((token) => /^[+-]?\d+$/.test(token.trim()))) {
    throw new RangeError('Enter integers separated by commas or spaces.')
  }
  const values = tokens.map(Number)
  validateInput(values)
  return values
}

/** The comparison anchor is the original last element, never the moving right bound. */
export function traceRotatedMinimum(values: readonly number[]): RotatedMinimumFrame[] {
  validateInput(values)
  const last = values[values.length - 1]!
  let left = 0
  let right = values.length - 1
  let mid: number | null = null
  let answer: number | null = null
  let comparisons = 0
  const frames: RotatedMinimumFrame[] = []
  const add = (instruction: RotatedMinimumFrame['instruction'], outcome: boolean | null = null) => {
    frames.push({ instruction, left, right, mid, answer, comparisons, outcome })
  }
  add('bounds')
  answer = -1
  add('answer')
  while (true) {
    add('loop', left <= right)
    if (left > right) break
    mid = left + Math.floor((right - left) / 2)
    add('midpoint')
    const matches = values[mid]! <= last
    comparisons++
    add('condition', matches)
    if (matches) {
      answer = mid
      add('save')
      right = mid - 1
      add('right')
    } else {
      left = mid + 1
      add('left')
    }
  }
  add('return')
  return frames
}

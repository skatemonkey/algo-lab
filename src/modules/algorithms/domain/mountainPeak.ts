import type { SearchFrame } from './binarySearch'

export type MountainPeakInstruction =
  | 'bounds'
  | 'answer'
  | 'loop'
  | 'midpoint'
  | 'condition'
  | 'save'
  | 'right'
  | 'else'
  | 'left'
  | 'return'
export type MountainPeakFrame = SearchFrame<Exclude<MountainPeakInstruction, 'else'>>

export function mountainPeakPseudocode() {
  return [
    { id: 'bounds', text: 'left ← 0, right ← n − 1', indent: 0 },
    { id: 'answer', text: 'answer ← −1', indent: 0 },
    { id: 'loop', text: 'while left ≤ right', indent: 0 },
    { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
    { id: 'condition', text: 'if A[mid] > A[mid + 1]', indent: 1 },
    { id: 'save', text: 'answer ← mid', indent: 2 },
    { id: 'right', text: 'right ← mid − 1', indent: 2 },
    { id: 'else', text: 'else', indent: 1 },
    { id: 'left', text: 'left ← mid + 1', indent: 2 },
    { id: 'return', text: 'return answer', indent: 0 },
  ] as { id: MountainPeakInstruction; text: string; indent: number }[]
}

function validateMountain(values: readonly number[]) {
  if (values.length < 3) throw new RangeError('A mountain needs at least 3 values.')
  if (values.some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError('Use whole numbers within the safe integer range.')
  }
  let index = 1
  while (index < values.length && values[index]! > values[index - 1]!) index++
  if (index === 1 || index === values.length) {
    throw new RangeError('The peak must be inside the array, with a rise and a fall.')
  }
  while (index < values.length && values[index]! < values[index - 1]!) index++
  if (index !== values.length) {
    throw new RangeError('Increase strictly to one peak, then decrease strictly. No plateaus.')
  }
}

export function parseMountainPeakInput(arrayText: string): number[] {
  let text = arrayText.trim()
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1).trim()
  const tokens = text ? (text.includes(',') ? text.split(',') : text.split(/\s+/)) : []
  if (!tokens.every((token) => /^[+-]?\d+$/.test(token.trim()))) {
    throw new RangeError('Enter integers separated by commas or spaces.')
  }
  const values = tokens.map(Number)
  validateMountain(values)
  return values
}

/** Record state after each statement. Input validation is outside the search itself. */
export function traceMountainPeak(values: readonly number[]): readonly MountainPeakFrame[] {
  validateMountain(values)
  let left = 0
  let right = values.length - 1
  let mid: number | null = null
  let answer: number | null = null
  let comparisons = 0
  const frames: MountainPeakFrame[] = []
  const add = (instruction: MountainPeakFrame['instruction'], outcome: boolean | null = null) => {
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
    const falling = values[mid]! > values[mid + 1]!
    comparisons++
    add('condition', falling)
    if (falling) {
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

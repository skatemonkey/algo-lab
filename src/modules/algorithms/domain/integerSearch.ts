import type { SearchFrame } from './binarySearch'

export const firstOccurrencePseudocode = [
  { id: 'bounds', text: 'left ← 0, right ← length(A) − 1', indent: 0 },
  { id: 'answer', text: 'answer ← −1', indent: 0 },
  { id: 'loop', text: 'while left ≤ right', indent: 0 },
  { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
  { id: 'condition', text: 'if A[mid] = target', indent: 1 },
  { id: 'save', text: 'answer ← mid', indent: 2 },
  { id: 'right-match', text: 'right ← mid − 1', indent: 2 },
  { id: 'smaller', text: 'else if A[mid] < target', indent: 1 },
  { id: 'left', text: 'left ← mid + 1', indent: 2 },
  { id: 'else', text: 'else', indent: 1 },
  { id: 'right', text: 'right ← mid − 1', indent: 2 },
  { id: 'return', text: 'return answer', indent: 0 },
] as const

export const firstNotSmallerPseudocode = [
  { id: 'bounds', text: 'left ← 0, right ← length(A) − 1', indent: 0 },
  { id: 'answer', text: 'answer ← −1', indent: 0 },
  { id: 'loop', text: 'while left ≤ right', indent: 0 },
  { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
  { id: 'condition', text: 'if A[mid] ≥ target', indent: 1 },
  { id: 'save', text: 'answer ← mid', indent: 2 },
  { id: 'right', text: 'right ← mid − 1', indent: 2 },
  { id: 'else', text: 'else', indent: 1 },
  { id: 'left', text: 'left ← mid + 1', indent: 2 },
  { id: 'return', text: 'return answer', indent: 0 },
] as const

export type IntegerSearchInstruction = Exclude<
  (typeof firstOccurrencePseudocode)[number]['id'],
  'else'
>
export type IntegerSearchFrame = SearchFrame<IntegerSearchInstruction>

export interface IntegerSearchExample {
  values: readonly number[]
  target: number
  answer: number
}

export interface IntegerSearchPreset extends IntegerSearchExample {
  label: string
}

export type IntegerSearchMode = 'exact' | 'at-least'

function validateInput(values: readonly number[], target: number) {
  if (!Number.isSafeInteger(target) || values.some((value) => !Number.isSafeInteger(value))) {
    throw new RangeError('Use whole numbers within the safe integer range.')
  }
  if (values.some((value, index) => index > 0 && value < values[index - 1]!)) {
    throw new RangeError('Keep the array sorted from smallest to largest.')
  }
}

export function parseIntegerSearchInput(arrayText: string, targetText: string) {
  let text = arrayText.trim()
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1).trim()
  const tokens = text ? (text.includes(',') ? text.split(',') : text.split(/\s+/)) : []
  const integer = /^[+-]?\d+$/
  if (!tokens.every((token) => integer.test(token.trim())) || !integer.test(targetText.trim())) {
    throw new RangeError('Enter integers separated by commas or spaces, and a whole-number target.')
  }
  const values = tokens.map(Number)
  const target = Number(targetText)
  validateInput(values, target)
  return { values, target }
}

/** Snapshots follow the pseudocode, including separate save and bound updates. */
function traceSearch(
  values: readonly number[],
  target: number,
  exact: boolean,
): IntegerSearchFrame[] {
  validateInput(values, target)
  if (!exact && (values.length === 0 || values[values.length - 1]! < target)) {
    throw new RangeError('Include at least one value greater than or equal to the target.')
  }

  let left = 0
  let right = values.length - 1
  let mid: number | null = null
  let answer: number | null = null
  let comparisons = 0
  const frames: IntegerSearchFrame[] = []
  const add = (instruction: IntegerSearchInstruction, outcome: boolean | null = null) => {
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
    const value = values[mid]!
    const matches = exact ? value === target : value >= target
    comparisons++
    add('condition', matches)

    if (matches) {
      answer = mid
      add('save')
      right = mid - 1
      add(exact ? 'right-match' : 'right')
    } else {
      if (exact) {
        comparisons++
        add('smaller', value < target)
      }
      if (value < target) {
        left = mid + 1
        add('left')
      } else {
        right = mid - 1
        add('right')
      }
    }
  }
  add('return')
  return frames
}

export const traceFirstOccurrence = (values: readonly number[], target: number) =>
  traceSearch(values, target, true)

export const traceFirstNotSmaller = (values: readonly number[], target: number) =>
  traceSearch(values, target, false)

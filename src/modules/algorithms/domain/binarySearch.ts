export const firstTruePseudocode = [
  { id: 'bounds', text: 'left ← 0, right ← length(A) − 1', indent: 0 },
  { id: 'answer', text: 'answer ← −1', indent: 0 },
  { id: 'loop', text: 'while left ≤ right', indent: 0 },
  { id: 'midpoint', text: 'mid ← floor((left + right) / 2)', indent: 1 },
  { id: 'condition', text: 'if A[mid] = true', indent: 1 },
  { id: 'save', text: 'answer ← mid', indent: 2 },
  { id: 'right', text: 'right ← mid − 1', indent: 2 },
  { id: 'else', text: 'else', indent: 1 },
  { id: 'left', text: 'left ← mid + 1', indent: 2 },
  { id: 'return', text: 'return answer', indent: 0 },
] as const

export type SearchInstruction = Exclude<(typeof firstTruePseudocode)[number]['id'], 'else'>
export interface SearchFrame<Instruction extends string = SearchInstruction> {
  instruction: Instruction
  left: number
  right: number
  mid: number | null
  answer: number | null
  comparisons: number
  outcome: boolean | null
}

/** Each snapshot is the state after executing its highlighted pseudocode statement. */
export function traceFirstTrue(values: readonly boolean[]): readonly SearchFrame[] {
  let seenTrue = false
  for (const value of values) {
    if (typeof value !== 'boolean' || (seenTrue && !value)) {
      throw new RangeError('The input must contain all false values before all true values.')
    }
    seenTrue ||= value
  }

  let left = 0
  let right = values.length - 1
  let mid: number | null = null
  let answer: number | null = null
  let comparisons = 0
  const frames: SearchFrame[] = []
  const add = (instruction: SearchInstruction, outcome: boolean | null = null) => {
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
    comparisons++
    add('condition', value)

    if (value) {
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

export function boundaryArray(length: number, firstTrue: number): boolean[] {
  if (
    !Number.isInteger(length) ||
    !Number.isInteger(firstTrue) ||
    length < 0 ||
    firstTrue < 0 ||
    firstTrue > length
  ) {
    throw new RangeError(
      'Choose a nonnegative length and a boundary from 0 through the array length.',
    )
  }
  return Array.from({ length }, (_, index) => index >= firstTrue)
}

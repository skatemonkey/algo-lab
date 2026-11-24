import type { SearchFrame } from './binarySearch'

export type SearchDirection = 'left' | 'right' | 'stop'
export type PatternInstruction =
  | 'bounds'
  | 'loop'
  | 'midpoint'
  | 'check'
  | 'search-left'
  | 'right'
  | 'search-right'
  | 'left'
  | 'stop'
  | 'return'
export interface PatternFrame extends SearchFrame<PatternInstruction> {
  round: number
}

/** Trace only the chosen path; wait at each check until a direction is supplied. */
export function traceBinarySearchPattern(
  length: number,
  directions: readonly SearchDirection[],
): readonly PatternFrame[] {
  if (!Number.isSafeInteger(length) || length < 0)
    throw new RangeError('Use a nonnegative integer length.')
  if (directions.some((direction) => !['left', 'right', 'stop'].includes(direction))) {
    throw new RangeError('Choose left, right, or stop.')
  }
  let left = 0
  let right = length - 1
  let mid: number | null = null
  let round = 0
  let comparisons = 0
  const frames: PatternFrame[] = []
  const add = (instruction: PatternInstruction, outcome: boolean | null = null) => {
    frames.push({ instruction, left, right, mid, round, comparisons, answer: null, outcome })
  }
  add('bounds')
  while (true) {
    add('loop', left <= right)
    if (left > right) break
    mid = left + Math.floor((right - left) / 2)
    add('midpoint')
    comparisons++
    add('check')

    const direction = directions[round]
    if (direction === undefined) return frames
    add('search-left', direction === 'left')
    if (direction === 'left') {
      right = mid - 1
      add('right')
    } else {
      add('search-right', direction === 'right')
      if (direction === 'right') {
        left = mid + 1
        add('left')
      } else {
        add('stop')
        break
      }
    }
    round++
  }
  add('return')
  return frames
}

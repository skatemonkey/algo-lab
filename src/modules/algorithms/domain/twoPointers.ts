import type { ExecutionVariable, LessonApproach, LessonExecution } from './lesson.ts'

export interface PointerRule {
  value: boolean
  condition: string
  actions: readonly string[]
  instructions?: readonly string[]
}

export function pointerRuleStep(
  rules: readonly PointerRule[],
  outcome: boolean | null,
  instruction: string,
) {
  const index =
    rules.find((rule) => rule.value === outcome)?.instructions?.indexOf(instruction) ?? -1
  return index < 0 ? undefined : index + 1
}

export interface PointerApproach extends Pick<LessonApproach, 'pattern' | 'variation'> {
  roles: readonly { name: string; initial: number | string; description: string }[]
  rules: readonly PointerRule[]
  result: string
  resultDescription: string
}

export const removeDuplicatesPseudocode = [
  { id: 'initialize', text: 'left ← 0, right ← 0', indent: 0 },
  { id: 'loop', text: 'while right < n', indent: 0 },
  { id: 'condition', text: 'if A[right] ≠ A[left]', indent: 1 },
  { id: 'left', text: 'left ← left + 1', indent: 2 },
  { id: 'write', text: 'A[left] ← A[right]', indent: 2 },
  { id: 'right', text: 'right ← right + 1', indent: 1 },
  { id: 'return', text: 'return left + 1', indent: 0 },
] as const
export const moveZerosPseudocode = [
  { id: 'initialize', text: 'left ← 0, right ← 0', indent: 0 },
  { id: 'loop', text: 'while right < n', indent: 0 },
  { id: 'condition', text: 'if A[right] ≠ 0', indent: 1 },
  { id: 'swap', text: 'swap(A[left], A[right])', indent: 2 },
  { id: 'left', text: 'left ← left + 1', indent: 2 },
  { id: 'right', text: 'right ← right + 1', indent: 1 },
  { id: 'return', text: 'return', indent: 0 },
] as const
export const linkedListMiddlePseudocode = [
  { id: 'initialize', text: 'slow ← head, fast ← head', indent: 0 },
  { id: 'loop', text: 'while fast ≠ null and fast.next ≠ null', indent: 0 },
  { id: 'slow', text: 'slow ← slow.next', indent: 1 },
  { id: 'fast', text: 'fast ← fast.next.next', indent: 1 },
  { id: 'return', text: 'return slow.value', indent: 0 },
] as const
export type ArrayTransformInstruction = (
  typeof removeDuplicatesPseudocode | typeof moveZerosPseudocode
)[number]['id']
export interface ArrayTransformFrame extends LessonExecution<ArrayTransformInstruction> {
  /** Keep the chosen rule active while its pointer moves and writes execute. */
  decision?: boolean | null
  values: readonly number[]
  left: number
  right: number
  prefixLength: number
  written: readonly number[]
  result: number | null
}
export interface LinkedListFrame extends LessonExecution<
  (typeof linkedListMiddlePseudocode)[number]['id']
> {
  decision: boolean | null
  slow: number
  fast: number | null
  result: number | null
}
function validateIntegers(values: readonly number[]) {
  if (values.some((value) => !Number.isSafeInteger(value)))
    throw new RangeError('Use whole numbers within the safe integer range.')
}
export function parseIntegerSequence(text: string): number[] {
  let value = text.trim()
  if (value.startsWith('[') && value.endsWith(']')) value = value.slice(1, -1).trim()
  const tokens = value ? (value.includes(',') ? value.split(',') : value.split(/\s+/)) : []
  if (tokens.some((token) => !/^[+-]?\d+$/.test(token.trim())))
    throw new RangeError('Enter integers separated by commas or spaces.')
  const values = tokens.map(Number)
  validateIntegers(values)
  return values
}
function validateSorted(values: readonly number[]) {
  validateIntegers(values)
  if (!values.length) throw new RangeError('Include at least one number.')
  if (values.some((value, index) => index > 0 && value < values[index - 1]!))
    throw new RangeError('Keep the array sorted from smallest to largest.')
}
export function parseRemoveDuplicatesInput(text: string) {
  const values = parseIntegerSequence(text)
  validateSorted(values)
  return values
}
export function parseLinkedListInput(text: string) {
  const values = parseIntegerSequence(text)
  if (!values.length) throw new RangeError('Include at least one node.')
  return values
}
/** Each frame owns its array snapshot so rewinding also restores writes and swaps. */
export function traceRemoveDuplicates(input: readonly number[]): ArrayTransformFrame[] {
  validateSorted(input)
  const values = [...input]
  let left = 0
  let right = 0
  let prefixLength = 1
  let decision: boolean | null = null
  const frames: ArrayTransformFrame[] = []
  const add = (
    instruction: ArrayTransformInstruction,
    outcome: boolean | null = null,
    written: number[] = [],
  ) => {
    frames.push({
      instruction,
      outcome,
      decision,
      left,
      right,
      prefixLength,
      values: [...values],
      written,
      result: instruction === 'return' ? left + 1 : null,
      ...(written.length
        ? { assignments: written.map((index) => ({ name: `A[${index}]`, value: values[index]! })) }
        : {}),
    })
  }
  add('initialize')
  while (true) {
    decision = null
    add('loop', right < values.length)
    if (right >= values.length) break
    const different = values[right] !== values[left]
    decision = different
    add('condition', different)
    if (different) {
      left++
      add('left')
      values[left] = values[right]!
      prefixLength = left + 1
      add('write', null, [left])
    }
    right++
    add('right')
  }
  add('return')
  return frames
}
export function traceMoveZeros(input: readonly number[]): ArrayTransformFrame[] {
  validateIntegers(input)
  const values = [...input]
  let left = 0
  let right = 0
  let prefixLength = 0
  let decision: boolean | null = null
  const frames: ArrayTransformFrame[] = []
  const add = (
    instruction: ArrayTransformInstruction,
    outcome: boolean | null = null,
    written: number[] = [],
  ) => {
    frames.push({
      instruction,
      outcome,
      decision,
      left,
      right,
      prefixLength,
      values: [...values],
      written,
      result: null,
      ...(written.length
        ? { assignments: written.map((index) => ({ name: `A[${index}]`, value: values[index]! })) }
        : {}),
    })
  }
  add('initialize')
  while (true) {
    decision = null
    add('loop', right < values.length)
    if (right >= values.length) break
    const nonzero = values[right] !== 0
    decision = nonzero
    add('condition', nonzero)
    if (nonzero) {
      ;[values[left], values[right]] = [values[right]!, values[left]!]
      prefixLength = left + 1
      add('swap', null, left === right ? [left] : [left, right])
      left++
      add('left')
    }
    right++
    add('right')
  }
  add('return')
  return frames
}
/** Indices identify nodes for rendering; next links drive the traversal. */
export function traceLinkedListMiddle(values: readonly number[]): LinkedListFrame[] {
  validateIntegers(values)
  if (!values.length) throw new RangeError('Include at least one node.')
  const next = values.map((_, index) => (index + 1 < values.length ? index + 1 : null))
  let slow = 0
  let fast: number | null = 0
  let decision: boolean | null = null
  const frames: LinkedListFrame[] = []
  const add = (instruction: LinkedListFrame['instruction'], outcome: boolean | null = null) => {
    frames.push({
      instruction,
      outcome,
      decision,
      slow,
      fast,
      result: instruction === 'return' ? values[slow]! : null,
    })
  }
  add('initialize')
  while (true) {
    const canAdvance = fast !== null && next[fast] !== null
    decision = canAdvance
    add('loop', canAdvance)
    if (!canAdvance || fast === null) break
    slow = next[slow]!
    add('slow')
    fast = next[next[fast]!]!
    add('fast')
  }
  add('return')
  return frames
}
export function arrayTransformVariables(frame: ArrayTransformFrame): ExecutionVariable[] {
  return [
    {
      name: 'left',
      value: frame.left,
      updated: ['initialize', 'left'].includes(frame.instruction),
    },
    {
      name: 'right',
      value: frame.right,
      updated: ['initialize', 'right'].includes(frame.instruction),
    },
  ]
}
export function linkedListVariables(frame: LinkedListFrame): ExecutionVariable[] {
  return [
    {
      name: 'slow',
      value: `node ${frame.slow}`,
      updated: ['initialize', 'slow'].includes(frame.instruction),
    },
    {
      name: 'fast',
      value: frame.fast === null ? 'null' : `node ${frame.fast}`,
      updated: ['initialize', 'fast'].includes(frame.instruction),
    },
  ]
}

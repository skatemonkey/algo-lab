import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  linkedListVariables,
  parseIntegerSequence,
  parseLinkedListInput,
  parseRemoveDuplicatesInput,
  traceLinkedListMiddle,
  traceMoveZeros,
  traceRemoveDuplicates,
} from '../twoPointers.ts'

function sequences(length: number, choices: number[]): number[][] {
  if (!length) return [[]]
  return sequences(length - 1, choices).flatMap((prefix) =>
    choices.map((value) => [...prefix, value]),
  )
}

test('remove duplicates keeps the sorted unique prefix, including signed and repeated values', () => {
  const cases = [[0, 0, 1, 1, 1, 2, 2], [7], [2, 2, 2, 2], [1, 2, 3, 4]]
  for (let length = 1; length <= 6; length++) {
    cases.push(
      ...sequences(length, [-2, 0, 3]).filter((values) =>
        values.every((value, i) => i === 0 || value >= values[i - 1]!),
      ),
    )
  }
  for (const input of cases) {
    const expected = [...new Set(input)]
    const frames = traceRemoveDuplicates(Object.freeze([...input]))
    const final = frames.at(-1)!
    assert.equal(final.result, expected.length)
    assert.deepEqual(final.values.slice(0, final.result!), expected)
    assert.equal(final.prefixLength, final.result)
    assert.equal(final.right, input.length)
    assert.deepEqual(frames[0]!.values, input)
    for (const frame of frames) {
      assert.equal(frame.values.length, input.length)
      assert.deepEqual(
        frame.values.slice(0, frame.prefixLength),
        expected.slice(0, frame.prefixLength),
      )
      if (frame.instruction === 'condition')
        assert.equal(frame.outcome, frame.values[frame.left] !== frame.values[frame.right])
    }
  }
})

test('copying a unique value is separate from advancing left and preserves earlier snapshots', () => {
  const frames = traceRemoveDuplicates([0, 0, 1, 1, 1, 2, 2])
  const index = frames.findIndex((frame) => frame.instruction === 'write')
  const before = frames[index - 1]!
  const after = frames[index]!
  assert.equal(before.instruction, 'left')
  assert.equal(before.left, 1)
  assert.equal(before.prefixLength, 1)
  assert.deepEqual(before.values, [0, 0, 1, 1, 1, 2, 2])
  assert.deepEqual(after.values, [0, 1, 1, 1, 1, 2, 2])
  assert.equal(after.prefixLength, 2)
  assert.deepEqual(after.written, [1])
  assert.deepEqual(after.assignments, [{ name: 'A[1]', value: 1 }])
  assert.notEqual(before.values, after.values)
  assert.equal(frames.at(-1)!.values[2], 2)
  assert.equal(after.values[2], 1)
})

test('moving zeros preserves every value and the original order of nonzero values', () => {
  const cases = [[1, 0, 2, 0, 0, 7]]
  for (let length = 0; length <= 6; length++) cases.push(...sequences(length, [-2, 0, 3]))
  for (const input of cases) {
    const nonzero = input.filter((value) => value !== 0)
    const expected = [...nonzero, ...input.filter((value) => value === 0)]
    const frames = traceMoveZeros(Object.freeze([...input]))
    const final = frames.at(-1)!
    assert.deepEqual(final.values, expected)
    assert.equal(final.left, nonzero.length)
    assert.equal(final.prefixLength, nonzero.length)
    assert.equal(final.result, null)
    assert.deepEqual(frames[0]!.values, input)
    for (const frame of frames) {
      assert.deepEqual(
        [...frame.values].sort((a, b) => a - b),
        [...input].sort((a, b) => a - b),
      )
      assert.deepEqual(
        frame.values.slice(0, frame.prefixLength),
        nonzero.slice(0, frame.prefixLength),
      )
      if (frame.instruction === 'condition')
        assert.equal(frame.outcome, frame.values[frame.right] !== 0)
    }
  }
})

test('swap frames expose both writes and can be rewound without changing previous arrays', () => {
  const frames = traceMoveZeros([1, 0, 2, 0, 0, 7])
  const index = frames.findIndex(
    (frame) => frame.instruction === 'swap' && frame.left !== frame.right,
  )
  const before = frames[index - 1]!
  const after = frames[index]!
  assert.deepEqual(before.values, [1, 0, 2, 0, 0, 7])
  assert.equal(frames[0]!.decision, null)
  assert.equal(before.decision, true)
  assert.equal(after.decision, true)
  assert.equal(frames[index + 1]!.decision, true)
  assert.equal(frames[index + 2]!.decision, true)
  assert.equal(frames[index + 3]!.decision, null)
  const skipped = frames.findIndex((frame) => frame.instruction === 'condition' && !frame.outcome)
  assert.equal(frames[skipped + 1]!.instruction, 'right')
  assert.equal(frames[skipped + 1]!.decision, false)
  assert.deepEqual(after.values, [1, 2, 0, 0, 0, 7])
  assert.deepEqual(after.written, [1, 2])
  assert.deepEqual(after.assignments, [
    { name: 'A[1]', value: 2 },
    { name: 'A[2]', value: 0 },
  ])
  assert.equal(frames[index + 1]!.instruction, 'left')
  assert.equal(frames[index + 1]!.left, 2)
  const empty = traceMoveZeros([])
  assert.deepEqual(
    empty.map((frame) => frame.instruction),
    ['initialize', 'loop', 'return'],
  )
  assert.equal(empty[1]!.outcome, false)
  assert.equal(empty.at(-1)!.decision, null)
})

test('slow and fast traverse node links and choose the second middle for every even length', () => {
  for (let length = 1; length <= 64; length++) {
    // Repeated values ensure node identity, rather than value, determines the middle.
    const values = Object.freeze(Array.from({ length }, (_, index) => (index % 3) - 1))
    const frames = traceLinkedListMiddle(values)
    const final = frames.at(-1)!
    assert.equal(frames[0]!.decision, null)
    assert.equal(final.decision, false)
    assert.equal(final.slow, Math.floor(length / 2))
    assert.equal(final.result, values[Math.floor(length / 2)])
    assert.equal(final.fast, length % 2 === 0 ? null : length - 1)
    assert.equal(frames.at(-2)!.instruction, 'loop')
    assert.equal(frames.at(-2)!.outcome, false)
    for (const [index, frame] of frames.entries()) {
      assert.ok(frame.slow >= 0 && frame.slow < length)
      assert.ok(frame.fast === null || (frame.fast >= 0 && frame.fast < length))
      if (frame.instruction === 'slow') {
        assert.equal(frame.decision, true)
        assert.equal(frame.slow, frames[index - 1]!.slow + 1)
        assert.equal(frame.fast, frames[index - 1]!.fast)
      }
      if (frame.instruction === 'fast') {
        assert.equal(frame.decision, true)
        const destination = frames[index - 1]!.fast! + 2
        assert.equal(frame.fast, destination < length ? destination : null)
        assert.equal(frame.slow, frames[index - 1]!.slow)
      }
      if (frame.instruction === 'loop')
        assert.equal(frame.outcome, frame.fast !== null && frame.fast + 1 < length)
    }
  }
  assert.equal(traceLinkedListMiddle([0, 1, 2, 3, 4]).at(-1)!.result, 2)
  assert.equal(traceLinkedListMiddle([0, 1, 2, 3, 4, 5]).at(-1)!.result, 3)
  const end = traceLinkedListMiddle([10, 20]).at(-1)!
  assert.deepEqual(
    linkedListVariables(end).map((variable) => variable.value),
    ['node 1', 'null'],
  )
})

test('input validation enforces each problem’s preconditions without hiding malformed tokens', () => {
  assert.deepEqual(parseIntegerSequence(' [+3, -2, 0] '), [3, -2, 0])
  assert.deepEqual(parseIntegerSequence('3  -2  0'), [3, -2, 0])
  assert.deepEqual(parseIntegerSequence('[]'), [])
  assert.deepEqual(parseIntegerSequence(''), [])
  assert.deepEqual(parseRemoveDuplicatesInput('-2,-2,0,3'), [-2, -2, 0, 3])
  assert.deepEqual(parseLinkedListInput('5,1,5'), [5, 1, 5])
  for (const text of [
    '1,,2',
    '1,',
    '1.5',
    'NaN',
    'Infinity',
    '1e2',
    '0x10',
    '[1,2',
    '1,2]',
    '9007199254740992',
  ]) {
    assert.throws(() => parseIntegerSequence(text), RangeError, text)
  }
  for (const text of ['', '[]', '2,1'])
    assert.throws(() => parseRemoveDuplicatesInput(text), RangeError)
  for (const text of ['', '[]']) assert.throws(() => parseLinkedListInput(text), RangeError)
  for (const invalid of [[NaN], [Infinity], [1.5], [Number.MAX_SAFE_INTEGER + 1]]) {
    assert.throws(() => traceRemoveDuplicates(invalid), RangeError)
    assert.throws(() => traceMoveZeros(invalid), RangeError)
    assert.throws(() => traceLinkedListMiddle(invalid), RangeError)
  }
  assert.throws(() => traceRemoveDuplicates([2, 1]), RangeError)
  assert.throws(() => traceRemoveDuplicates([]), RangeError)
  assert.throws(() => traceLinkedListMiddle([]), RangeError)
})

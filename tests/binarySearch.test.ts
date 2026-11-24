import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  boundaryArray,
  traceFirstTrue,
  type SearchInstruction,
} from '../src/modules/algorithms/domain/binarySearch.ts'

test('the example checks indices 2, 0, and 1, saving the candidate before moving the bound', () => {
  const values = [false, false, true, true, true]
  const frames = traceFirstTrue(values)
  assert.deepEqual(
    frames.filter((frame) => frame.instruction === 'condition').map((frame) => frame.mid),
    [2, 0, 1],
  )
  assert.equal(frames[0]!.answer, null)
  assert.equal(frames[1]!.answer, -1)
  const saveIndex = frames.findIndex((frame) => frame.instruction === 'save')
  assert.equal(frames[saveIndex - 1]!.answer, -1)
  assert.equal(frames[saveIndex]!.answer, 2)
  assert.equal(frames[saveIndex]!.right, 4)
  assert.equal(frames[saveIndex + 1]!.instruction, 'right')
  assert.equal(frames[saveIndex + 1]!.right, 1)
  assert.equal(frames.at(-1)!.answer, 2)
  assert.deepEqual(values, [false, false, true, true, true])
})

test('every boundary through length 64 agrees with a linear oracle and maintains the search invariant', () => {
  for (let length = 0; length <= 64; length++) {
    for (let boundary = 0; boundary <= length; boundary++) {
      const values = boundaryArray(length, boundary)
      const expected = values.findIndex(Boolean)
      const frames = traceFirstTrue(values)
      const result = frames.at(-1)!
      assert.equal(result.answer, expected, `length=${length}, boundary=${boundary}`)
      assert.equal(result.instruction, 'return')
      assert.ok(result.left > result.right)
      assert.ok(result.comparisons <= (length === 0 ? 0 : Math.floor(Math.log2(length)) + 1))
      for (const frame of frames) {
        if (frame.answer !== null && frame.answer !== -1) assert.equal(values[frame.answer], true)
        if (expected !== -1)
          assert.ok(
            frame.answer === expected || (expected >= frame.left && expected <= frame.right),
          )
        if (frame.instruction === 'midpoint') {
          assert.ok(frame.mid! >= frame.left && frame.mid! <= frame.right)
          assert.equal(frame.mid, frame.left + Math.floor((frame.right - frame.left) / 2))
        }
        if (frame.instruction === 'loop') assert.equal(frame.outcome, frame.left <= frame.right)
        if (frame.instruction === 'condition') assert.equal(frame.outcome, values[frame.mid!])
      }
      assert.equal(frames.at(-2)!.instruction, 'loop')
      assert.equal(frames.at(-2)!.outcome, false)
    }
  }
})

test('each statement changes only its own variables, with no hidden updates between steps', () => {
  const allowedChanges: Record<SearchInstruction, string[]> = {
    bounds: ['left', 'right'],
    answer: ['answer'],
    loop: [],
    midpoint: ['mid'],
    condition: ['comparisons'],
    save: ['answer'],
    right: ['right'],
    left: ['left'],
    return: [],
  }
  for (const boundary of [0, 2, 7, 12]) {
    const frames = traceFirstTrue(boundaryArray(12, boundary))
    for (let index = 1; index < frames.length; index++) {
      const previous = frames[index - 1]!
      const current = frames[index]!
      for (const variable of ['left', 'right', 'mid', 'answer', 'comparisons'] as const) {
        if (current[variable] !== previous[variable])
          assert.ok(
            allowedChanges[current.instruction].includes(variable),
            `${current.instruction} unexpectedly changed ${variable}`,
          )
      }
    }
  }
})

test('empty, singleton, all-false, and all-true inputs return their correct boundaries', () => {
  for (const [values, expected] of [
    [[], -1],
    [[false], -1],
    [[true], 0],
    [[false, false], -1],
    [[true, true], 0],
  ] as const)
    assert.equal(traceFirstTrue(values).at(-1)!.answer, expected)
  const empty = traceFirstTrue([])
  assert.equal(empty.at(-1)!.comparisons, 0)
  assert.deepEqual(
    empty.map((frame) => frame.instruction),
    ['bounds', 'answer', 'loop', 'return'],
  )
})

test('invalid ordering and invalid input dimensions are rejected', () => {
  assert.throws(() => traceFirstTrue([true, false]), RangeError)
  for (const dimensions of [
    [-1, 0],
    [2, 3],
    [2, -1],
    [2.5, 1],
    [2, NaN],
  ])
    assert.throws(() => boundaryArray(dimensions[0]!, dimensions[1]!), RangeError)
})

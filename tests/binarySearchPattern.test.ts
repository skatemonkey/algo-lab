import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  traceBinarySearchPattern,
  type SearchDirection,
} from '../src/modules/algorithms/domain/binarySearchPattern.ts'
import { binarySearchPattern } from '../src/modules/algorithms/patterns/binarySearch.ts'

test('the general trace waits at the middle without inventing a comparison or an answer', () => {
  const frames = traceBinarySearchPattern(12, [])
  assert.deepEqual(
    frames.map((frame) => frame.instruction),
    ['bounds', 'loop', 'midpoint', 'check'],
  )
  assert.equal(frames[0]!.mid, null)
  assert.equal(frames.at(-1)!.mid, 5)
  assert.equal(frames.at(-1)!.left, 0)
  assert.equal(frames.at(-1)!.right, 11)
  assert.equal(frames.at(-1)!.round, 0)
  assert.ok(frames.every((frame) => frame.answer === null))
})

test('choosing a direction preserves the old bounds until its assignment executes', () => {
  const left = traceBinarySearchPattern(12, ['left'])
  const decision = left.findIndex((frame) => frame.instruction === 'search-left')
  assert.equal(left[decision]!.outcome, true)
  assert.equal(left[decision]!.right, 11)
  assert.equal(left[decision + 1]!.instruction, 'right')
  assert.equal(left[decision + 1]!.right, 4)
  assert.equal(left.at(-1)!.mid, 2)
  const right = traceBinarySearchPattern(12, ['right'])
  assert.equal(right.find((frame) => frame.instruction === 'search-left')!.outcome, false)
  assert.equal(right.find((frame) => frame.instruction === 'search-right')!.outcome, true)
  assert.equal(right.find((frame) => frame.instruction === 'left')!.left, 6)
  assert.equal(right.at(-1)!.mid, 8)
  assert.deepEqual(left.slice(0, 4), right.slice(0, 4))
})

test('every direction sequence halves the range, keeps mid in bounds, and terminates', () => {
  const instructions = new Set<string>(binarySearchPattern.pseudocode.map((line) => line.id))
  for (let length = 0; length <= 32; length++) {
    for (let mask = 0; mask < 64; mask++) {
      const choices: SearchDirection[] = Array.from({ length: 6 }, (_, index) =>
        mask & (1 << index) ? 'left' : 'right',
      )
      const frames = traceBinarySearchPattern(length, choices)
      const last = frames.at(-1)!
      assert.equal(last.instruction, 'return')
      assert.ok(last.left > last.right)
      assert.ok(last.comparisons <= (length ? Math.floor(Math.log2(length)) + 1 : 0))
      for (const [index, frame] of frames.entries()) {
        assert.ok(instructions.has(frame.instruction))
        if (frame.instruction === 'midpoint') {
          assert.ok(frame.left <= frame.mid! && frame.mid! <= frame.right)
          assert.equal(frame.mid, frame.left + Math.floor((frame.right - frame.left) / 2))
        }
        if (frame.instruction === 'left' || frame.instruction === 'right') {
          const previous = frames[index - 1]!
          assert.ok(
            frame.right - frame.left + 1 <= Math.floor((previous.right - previous.left + 1) / 2),
          )
          if (frame.instruction === 'left') {
            assert.equal(frame.left, previous.mid! + 1)
            assert.equal(frame.right, previous.right)
          } else {
            assert.equal(frame.right, previous.mid! - 1)
            assert.equal(frame.left, previous.left)
          }
        }
      }
    }
  }
})

test('stop finishes without moving bounds and invalid directions are rejected', () => {
  const frames = traceBinarySearchPattern(12, ['stop', 'left'])
  assert.equal(frames.at(-2)!.instruction, 'stop')
  assert.equal(frames.at(-1)!.instruction, 'return')
  assert.equal(frames.at(-1)!.left, 0)
  assert.equal(frames.at(-1)!.right, 11)
  assert.equal(frames.at(-1)!.mid, 5)
  assert.deepEqual(
    traceBinarySearchPattern(0, []).map((frame) => frame.instruction),
    ['bounds', 'loop', 'return'],
  )
  for (const length of [-1, NaN, 1.5, Infinity])
    assert.throws(() => traceBinarySearchPattern(length, []), RangeError)
  assert.throws(() => traceBinarySearchPattern(12, ['invalid' as SearchDirection]), RangeError)
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseMountainPeakInput, traceMountainPeak } from '../mountainPeak.ts'

test('finds every interior peak and never reads past the last element', () => {
  for (let length = 3; length <= 64; length++) {
    for (let peak = 1; peak < length - 1; peak++) {
      const values = Object.freeze(
        Array.from({ length }, (_, i) =>
          i <= peak ? -50 + 3 * i : -50 + 3 * peak - 2 * (i - peak),
        ),
      )
      const frames = traceMountainPeak(values)
      const result = frames.at(-1)!
      assert.equal(result.answer, peak, `n=${length}, peak=${peak}`)
      assert.equal(result.instruction, 'return')
      assert.ok(result.left > result.right)
      assert.ok(result.comparisons <= Math.floor(Math.log2(length)) + 1)
      for (const frame of frames) {
        assert.ok((frame.left <= peak && peak <= frame.right) || frame.answer === peak)
        if (frame.mid !== null) assert.ok(frame.mid >= 0 && frame.mid < length - 1)
        if (frame.instruction === 'midpoint') {
          assert.equal(frame.mid, Math.floor((frame.left + frame.right) / 2))
        }
        if (frame.instruction === 'condition') {
          assert.equal(frame.outcome, values[frame.mid!]! > values[frame.mid! + 1]!)
        }
      }
    }
  }
})

test('candidate saving is separate from narrowing the range', () => {
  const values = [0, 1, 2, 3, 2, 1, 0]
  const frames = traceMountainPeak(values)
  const saveIndex = frames.findIndex((frame) => frame.instruction === 'save')
  assert.equal(frames[saveIndex]!.answer, 3)
  assert.equal(frames[saveIndex]!.right, 6)
  assert.equal(frames[saveIndex + 1]!.instruction, 'right')
  assert.equal(frames[saveIndex + 1]!.right, 2)
  assert.equal(frames.at(-1)!.answer, 3)
})

test('mountain inputs accept negative values, unequal side lengths, and repeated opposite-side values', () => {
  for (const [input, expected, peak] of [
    ['[0, 1, 0]', [0, 1, 0], 1],
    [' -9 -3 -6 -8 ', [-9, -3, -6, -8], 1],
    ['+1, 4, 7, 9, 7, 4', [1, 4, 7, 9, 7, 4], 3],
    [
      '-9007199254740991, 9007199254740991, 0',
      [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0],
      1,
    ],
  ] as const) {
    const values = parseMountainPeakInput(input)
    assert.deepEqual(values, expected)
    assert.equal(traceMountainPeak(values).at(-1)!.answer, peak)
  }
})

test('invalid mountains and malformed integers are rejected before searching', () => {
  for (const input of [
    '',
    '[]',
    '1,2',
    '1,2,3',
    '3,2,1',
    '2,1,2',
    '0,2,2,0',
    '0,3,1,2,0',
    '1,1,2,1',
    '0,2,1,1',
    '0,,3,0',
    '0,1.5,0',
    '0,1e2,0',
    '[0,1,0',
    '0,Infinity,0',
    '0,9007199254740992,0',
  ])
    assert.throws(() => parseMountainPeakInput(input), RangeError, input)
  for (const values of [[], [0, 1], [0, NaN, 0], [0, Infinity, 0], [0, 1, 1, 0]]) {
    assert.throws(() => traceMountainPeak(values), RangeError)
  }
})

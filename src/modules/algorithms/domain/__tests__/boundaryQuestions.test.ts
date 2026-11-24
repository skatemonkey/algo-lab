import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseSquareRootInput, traceSquareRoot, type SquareRootApproach } from '../squareRoot.ts'
import { parseRotatedMinimumInput, traceRotatedMinimum } from '../rotatedMinimum.ts'

test('both square-root boundaries return the unique floor root, including large exact squares', () => {
  const largestRoot = 94906265n
  const cases = [
    ...Array.from({ length: 1025 }, (_, n) => n),
    Number(largestRoot * largestRoot - 1n),
    Number(largestRoot * largestRoot),
    Number(largestRoot * largestRoot + 1n),
    Number.MAX_SAFE_INTEGER,
  ]
  for (const n of cases) {
    for (const approach of ['lower', 'upper'] as const) {
      const frames = traceSquareRoot(n, approach)
      const final = frames.at(-1)!
      const root = BigInt(final.result!)
      assert.ok(root * root <= BigInt(n) && (root + 1n) ** 2n > BigInt(n), `${approach}, n=${n}`)
      assert.equal(final.instruction, 'return')
      assert.ok(final.left > final.right)
      assert.ok(
        frames.filter((frame) => frame.instruction === 'midpoint').length <=
          Math.floor(Math.log2(n + 1)) + 1,
      )
      const boundary =
        approach === 'upper' && root * root !== BigInt(n) ? Number(root + 1n) : Number(root)
      assert.equal(final.answer, boundary)
      assert.equal(
        frames.some((frame) => frame.instruction === 'adjust'),
        approach === 'upper' && root * root !== BigInt(n),
      )
      for (const frame of frames) {
        assert.ok((frame.left <= boundary && boundary <= frame.right) || frame.answer === boundary)
        if (frame.instruction === 'midpoint')
          assert.equal(frame.mid, frame.left + Math.floor((frame.right - frame.left) / 2))
        if (frame.instruction === 'square') assert.equal(frame.square, BigInt(frame.mid!) ** 2n)
        if (frame.instruction === 'condition')
          assert.equal(
            frame.outcome,
            approach === 'lower' ? frame.square! <= BigInt(n) : frame.square! >= BigInt(n),
          )
      }
    }
  }
})

test('square-root playback separates candidate saving, bound updates, and the upper correction', () => {
  for (const approach of ['lower', 'upper'] as SquareRootApproach[]) {
    const frames = traceSquareRoot(8, approach)
    const saves = frames.filter((frame) => frame.instruction === 'save')
    assert.equal(saves.at(-1)!.answer, approach === 'lower' ? 2 : 3)
    for (const [index, frame] of frames.entries()) {
      if (frame.instruction !== 'save') continue
      assert.equal(frame.left, frames[index - 1]!.left)
      assert.equal(frame.right, frames[index - 1]!.right)
      assert.equal(frame.answer, frame.mid)
    }
  }
  const upper = traceSquareRoot(8, 'upper')
  const adjustment = upper.findIndex((frame) => frame.instruction === 'adjust')
  assert.equal(upper[adjustment - 1]!.result, 3)
  assert.equal(upper[adjustment]!.result, 2)
  assert.equal(upper[adjustment]!.answer, 3)
  assert.ok(!traceSquareRoot(16, 'upper').some((frame) => frame.instruction === 'adjust'))
})

test('square-root input rejects negative, fractional, malformed, and unsafe integers', () => {
  assert.equal(parseSquareRootInput(' +16 '), 16)
  assert.equal(parseSquareRootInput('0'), 0)
  for (const text of ['', '-1', '1.5', '1e2', 'NaN', 'Infinity', '0x10', '9007199254740992']) {
    assert.throws(() => parseSquareRootInput(text), RangeError, text)
  }
  for (const n of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => traceSquareRoot(n, 'lower'), RangeError)
  }
})

test('every pivot returns the minimum index and compares against the original last value', () => {
  for (let length = 1; length <= 40; length++) {
    const sorted = Array.from({ length }, (_, index) => index * 7 - 100)
    for (let pivot = 0; pivot < length; pivot++) {
      const values = Object.freeze([...sorted.slice(pivot), ...sorted.slice(0, pivot)])
      const expected = values.indexOf(sorted[0]!)
      const frames = traceRotatedMinimum(values)
      assert.equal(frames.at(-1)!.answer, expected)
      assert.ok(
        frames.filter((frame) => frame.instruction === 'midpoint').length <=
          Math.floor(Math.log2(length)) + 1,
      )
      for (const frame of frames) {
        assert.ok((frame.left <= expected && expected <= frame.right) || frame.answer === expected)
        if (frame.instruction === 'condition')
          assert.equal(frame.outcome, values[frame.mid!]! <= values.at(-1)!)
        if (frame.instruction === 'save') assert.ok(values[frame.answer!]! <= values.at(-1)!)
      }
    }
  }
  assert.equal(traceRotatedMinimum([30, 40, 50, 10, 20]).at(-1)!.answer, 3)
  const lastMinimum = traceRotatedMinimum([3, 5, 7, 11, 13, 17, 19, 2])
  assert.equal(lastMinimum.at(-1)!.answer, 7)
  assert.ok(
    lastMinimum.some(
      (frame) => frame.instruction === 'condition' && frame.mid === 7 && frame.outcome,
    ),
  )
})

test('rotated input allows signed rotations and rejects duplicates or invalid shapes', () => {
  assert.deepEqual(parseRotatedMinimumInput('[3, 7, -5, -1]'), [3, 7, -5, -1])
  assert.deepEqual(parseRotatedMinimumInput('1 3 7'), [1, 3, 7])
  assert.deepEqual(parseRotatedMinimumInput('[-2]'), [-2])
  for (const text of [
    '',
    '[]',
    '1,1',
    '1,2,1',
    '2,1,3',
    '3,1,2,0',
    '1,,3',
    '1.5,3',
    '[1,3',
    '1e2',
    '9007199254740992',
  ]) {
    assert.throws(() => parseRotatedMinimumInput(text), RangeError, text)
  }
  for (const values of [[], [NaN], [1, Infinity], [1, 1], [2, 1, 3]]) {
    assert.throws(() => traceRotatedMinimum(values), RangeError)
  }
})

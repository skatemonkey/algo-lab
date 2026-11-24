import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  firstOccurrencePseudocode,
  firstNotSmallerPseudocode,
  parseIntegerSearchInput,
  traceFirstOccurrence,
  traceFirstNotSmaller,
  type IntegerSearchFrame,
} from '../src/modules/algorithms/domain/integerSearch.ts'

test('first occurrence keeps searching after a match and records only exact matches', () => {
  const values = Object.freeze([1, 3, 3, 3, 3, 6, 10, 10, 10, 100])
  const frames = traceFirstOccurrence(values, 3)
  assert.equal(frames.at(-1)!.answer, 1)
  assert.deepEqual(
    frames.filter((frame) => frame.instruction === 'save').map((frame) => frame.answer),
    [4, 1],
  )
  const firstSave = frames.findIndex((frame) => frame.instruction === 'save')
  assert.equal(frames[firstSave - 1]!.answer, -1)
  assert.equal(frames[firstSave]!.right, 9)
  assert.equal(frames[firstSave + 1]!.right, 3)
  const absent = traceFirstOccurrence([2, 3, 5, 7, 11, 13, 17, 19], 6)
  assert.equal(absent.at(-1)!.answer, -1)
  assert.ok(absent.some((frame) => frame.instruction === 'smaller' && frame.outcome === false))
  assert.ok(absent.some((frame) => frame.instruction === 'smaller' && frame.outcome === true))
  assert.ok(!absent.some((frame) => frame.instruction === 'save'))
})

test('first not smaller accepts both equal and larger values', () => {
  assert.equal(traceFirstNotSmaller([1, 3, 3, 5, 8, 8, 10], 2).at(-1)!.answer, 1)
  assert.equal(traceFirstNotSmaller([2, 3, 5, 7, 11, 13, 17, 19], 6).at(-1)!.answer, 3)
  assert.equal(traceFirstNotSmaller([1, 3, 3, 3, 8], 3).at(-1)!.answer, 1)
  assert.equal(traceFirstNotSmaller([3, 3, 3], 3).at(-1)!.answer, 0)
  assert.equal(traceFirstNotSmaller([3], -2).at(-1)!.answer, 0)
})

function* sortedArrays(length: number, start = 0, prefix: number[] = []): Generator<number[]> {
  const alphabet = [-2, 0, 1, 3]
  if (prefix.length === length) {
    yield prefix
    return
  }
  for (let index = start; index < alphabet.length; index++) {
    yield* sortedArrays(length, index, [...prefix, alphabet[index]!])
  }
}

function checkTrace(
  values: readonly number[],
  target: number,
  exact: boolean,
  frames: readonly IntegerSearchFrame[],
) {
  const qualifies = (value: number) => (exact ? value === target : value >= target)
  const expected = values.findIndex(qualifies)
  const code = new Set<string>(
    (exact ? firstOccurrencePseudocode : firstNotSmallerPseudocode).map((line) => line.id),
  )
  assert.equal(frames.at(-1)!.answer, expected, `${values}, target ${target}, exact ${exact}`)
  assert.equal(frames.at(-1)!.instruction, 'return')
  assert.equal(frames.at(-2)!.outcome, false)
  assert.ok(frames.at(-1)!.left > frames.at(-1)!.right)
  assert.ok(
    frames.filter((frame) => frame.instruction === 'midpoint').length <=
      (values.length ? Math.floor(Math.log2(values.length)) + 1 : 0),
  )

  const allowed: Record<string, string[]> = {
    bounds: ['left', 'right'],
    answer: ['answer'],
    loop: [],
    midpoint: ['mid'],
    condition: ['comparisons'],
    smaller: ['comparisons'],
    save: ['answer'],
    'right-match': ['right'],
    right: ['right'],
    left: ['left'],
    return: [],
  }
  for (const [index, frame] of frames.entries()) {
    assert.ok(code.has(frame.instruction), `Missing pseudocode: ${frame.instruction}`)
    if (frame.answer !== null && frame.answer !== -1) assert.ok(qualifies(values[frame.answer]!))
    if (expected !== -1)
      assert.ok(frame.answer === expected || (frame.left <= expected && expected <= frame.right))
    if (frame.instruction === 'midpoint') {
      assert.ok(frame.mid! >= frame.left && frame.mid! <= frame.right)
      assert.equal(frame.mid, frame.left + Math.floor((frame.right - frame.left) / 2))
    }
    if (frame.instruction === 'loop') assert.equal(frame.outcome, frame.left <= frame.right)
    if (frame.instruction === 'condition')
      assert.equal(frame.outcome, qualifies(values[frame.mid!]!))
    if (frame.instruction === 'smaller') assert.equal(frame.outcome, values[frame.mid!]! < target)
    if (index === 0) continue
    const previous = frames[index - 1]!
    for (const variable of ['left', 'right', 'mid', 'answer', 'comparisons'] as const) {
      if (frame[variable] !== previous[variable])
        assert.ok(
          allowed[frame.instruction]!.includes(variable),
          `${frame.instruction} changed ${variable}`,
        )
    }
  }
}

test('sorted arrays with duplicates agree with a linear oracle and preserve the search invariant', () => {
  for (let length = 0; length <= 6; length++) {
    for (const values of sortedArrays(length)) {
      const frozen = Object.freeze(values)
      for (let target = -3; target <= 4; target++) {
        checkTrace(frozen, target, true, traceFirstOccurrence(frozen, target))
        if (values.some((value) => value >= target))
          checkTrace(frozen, target, false, traceFirstNotSmaller(frozen, target))
      }
    }
  }
})

test('integer input accepts signed sorted arrays and rejects malformed or unsorted data', () => {
  assert.deepEqual(parseIntegerSearchInput('[-5, -1, -1, +2]', '-1'), {
    values: [-5, -1, -1, 2],
    target: -1,
  })
  assert.deepEqual(parseIntegerSearchInput('1  3 3  8', '3'), { values: [1, 3, 3, 8], target: 3 })
  assert.deepEqual(parseIntegerSearchInput('[]', '4'), { values: [], target: 4 })
  for (const input of [
    '3, 1',
    '1,,3',
    '[1, 3',
    '1, 3]',
    '1.5, 3',
    'true',
    'NaN',
    '0x10',
    '1e2',
    '9007199254740992',
  ]) {
    assert.throws(() => parseIntegerSearchInput(input, '3'), RangeError, input)
  }
  for (const target of ['', '1.2', 'NaN', 'Infinity', '1e2', '9007199254740992']) {
    assert.throws(() => parseIntegerSearchInput('1, 3', target), RangeError)
  }
})

test('search preconditions are enforced without changing the supplied input', () => {
  for (const trace of [traceFirstOccurrence, traceFirstNotSmaller]) {
    assert.throws(() => trace([3, 1], 1), RangeError)
    assert.throws(() => trace([1, 1.5], 1), RangeError)
    assert.throws(() => trace([1, 3], NaN), RangeError)
  }
  assert.equal(traceFirstOccurrence([], 3).at(-1)!.answer, -1)
  assert.throws(() => traceFirstNotSmaller([], 3), /at least one value/)
  assert.throws(() => traceFirstNotSmaller([1, 3], 4), /at least one value/)
  assert.equal(
    traceFirstOccurrence(
      [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
      Number.MAX_SAFE_INTEGER,
    ).at(-1)!.answer,
    1,
  )
})

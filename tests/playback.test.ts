import assert from 'node:assert/strict'
import { test } from 'node:test'
import { effectScope, ref } from 'vue'
import { usePlayback } from '../src/modules/algorithms/composables/usePlayback.ts'

test('playback supports stepping, seeking, speed changes, completion, and replay', (context) => {
  context.mock.timers.enable({ apis: ['setInterval'] })
  const scope = effectScope()
  const playback = scope.run(() => usePlayback(ref(['ready', 'check', 'narrow', 'done'])))!
  try {
    playback.previous()
    assert.equal(playback.cursor.value, 0)
    playback.toggle()
    context.mock.timers.tick(1300)
    assert.equal(playback.frame.value, 'check')
    playback.speed.value = 2
    context.mock.timers.tick(650)
    assert.equal(playback.frame.value, 'narrow')
    context.mock.timers.tick(650)
    assert.equal(playback.frame.value, 'done')
    assert.equal(playback.playing.value, false)
    playback.toggle()
    assert.equal(playback.cursor.value, 0)
    assert.equal(playback.playing.value, true)
    playback.seek(999)
    assert.equal(playback.cursor.value, 3)
    assert.equal(playback.playing.value, false)
    playback.previous()
    assert.equal(playback.frame.value, 'narrow')
    playback.reset()
    assert.equal(playback.frame.value, 'ready')
  } finally {
    scope.stop()
  }
})

test('editing inputs resets playback and disposal cancels the timer', (context) => {
  context.mock.timers.enable({ apis: ['setInterval'] })
  const scope = effectScope()
  const frames = ref(['ready', 'check', 'done'])
  const playback = scope.run(() => usePlayback(frames))!
  playback.toggle()
  context.mock.timers.tick(1300)
  frames.value = ['new input', 'done']
  assert.equal(playback.cursor.value, 0)
  assert.equal(playback.playing.value, false)
  assert.equal(playback.frame.value, 'new input')
  playback.toggle()
  scope.stop()
  context.mock.timers.tick(13000)
  assert.equal(playback.cursor.value, 0)
})

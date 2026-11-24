import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'

/** Playback is independent of the algorithm and accepts any nonempty frame sequence. */
export function usePlayback<T>(frames: Readonly<Ref<readonly T[]>>) {
  const cursor = ref(0)
  const playing = ref(false)
  const speed = ref(1)
  const last = computed(() => Math.max(0, frames.value.length - 1))
  const frame = computed(() => frames.value[cursor.value]!)
  const finished = computed(() => cursor.value === last.value)
  let timer: ReturnType<typeof setInterval> | undefined
  const pause = () => {
    playing.value = false
  }
  const seek = (index: number) => {
    pause()
    cursor.value = Math.max(0, Math.min(last.value, Math.trunc(index)))
  }
  const reset = () => seek(0)
  const next = () => seek(cursor.value + 1)
  const previous = () => seek(cursor.value - 1)
  const toggle = () => {
    if (playing.value) return pause()
    if (finished.value) cursor.value = 0
    playing.value = true
  }

  watch(frames, reset, { flush: 'sync' })
  watch(
    [playing, speed],
    () => {
      clearInterval(timer)
      if (!playing.value) return
      timer = setInterval(() => {
        cursor.value = Math.min(cursor.value + 1, last.value)
        if (finished.value) pause()
      }, 1300 / speed.value)
    },
    { flush: 'sync' },
  )
  onScopeDispose(() => clearInterval(timer))

  return {
    cursor,
    playing,
    speed,
    last,
    frame,
    finished,
    pause,
    seek,
    reset,
    next,
    previous,
    toggle,
  }
}

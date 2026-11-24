import {
  computed,
  inject,
  onMounted,
  onScopeDispose,
  provide,
  shallowReactive,
  type InjectionKey,
  type Ref,
} from 'vue'

type Direction = -1 | 1
type NavigationMove = Direction | 'first' | 'last'
type NavigationLevel = 'sections' | 'steps' | 'questions'
type PlaybackAction = 'previous' | 'next' | 'toggle'

export interface LessonPlaybackControls {
  toggle: () => void
  next: () => void
  previous: () => void
  enabled?: () => boolean
}
interface LessonNavigation {
  level: NavigationLevel
  root: Readonly<Ref<HTMLElement | null>>
  count: () => number
  move: (move: NavigationMove, options?: { focus?: boolean }) => void
}

// The handler and the shortcut reference use this same binding list.
const lessonShortcuts = [
  {
    id: 'playback',
    keys: '← / →',
    label: 'Visualization step',
    level: 'playback',
    shift: false,
    bindings: [
      { key: 'ArrowLeft', action: 'previous' },
      { key: 'ArrowRight', action: 'next' },
    ],
  },
  {
    id: 'toggle',
    keys: 'Space',
    label: 'Play / pause',
    level: 'playback',
    shift: false,
    bindings: [{ key: ' ', action: 'toggle' }],
  },
  {
    id: 'sections',
    keys: 'Shift + ← / →',
    label: 'Lesson section',
    level: 'sections',
    shift: true,
    bindings: [
      { key: 'ArrowLeft', action: 'previous' },
      { key: 'ArrowRight', action: 'next' },
    ],
  },
  {
    id: 'steps',
    keys: 'Shift + [ / ]',
    label: 'Approach / reasoning step',
    level: 'steps',
    shift: true,
    bindings: [
      { key: '[', action: 'previous' },
      { key: ']', action: 'next' },
      // Shifted brackets produce braces on common keyboard layouts.
      { key: '{', action: 'previous' },
      { key: '}', action: 'next' },
    ],
  },
  {
    id: 'questions',
    keys: '[ / ]',
    label: 'Question',
    level: 'questions',
    shift: false,
    bindings: [
      { key: '[', action: 'previous' },
      { key: ']', action: 'next' },
    ],
  },
] as const

interface LessonKeyboard {
  registerPlayback: (controls: LessonPlaybackControls) => () => void
  registerNavigation: (navigation: LessonNavigation) => () => void
  shortcuts: Readonly<Ref<readonly (typeof lessonShortcuts)[number][]>>
}
const lessonKeyboardKey: InjectionKey<LessonKeyboard> = Symbol('lesson-keyboard')

/** One controller for the Algorithms module; pages only register their controls. */
export function provideLessonKeyboard(root: Readonly<Ref<HTMLElement | null>>) {
  const playbacks = new Set<LessonPlaybackControls>()
  const navigations = shallowReactive(new Set<LessonNavigation>())
  const visibleNavigation = (level?: NavigationLevel) =>
    [...navigations]
      .reverse()
      .filter(
        (navigation) =>
          (!level || navigation.level === level) &&
          navigation.count() > 1 &&
          !!navigation.root.value?.getClientRects().length,
      )
  const shortcuts = computed(() =>
    lessonShortcuts.filter(
      (shortcut) =>
        shortcut.level === 'playback' ||
        [...navigations].some(
          (navigation) => navigation.level === shortcut.level && navigation.count() > 1,
        ),
    ),
  )

  function keydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || event.repeat) return
    if (event.altKey || event.ctrlKey || event.metaKey) return
    const target = event.target instanceof HTMLElement ? event.target : null
    if (
      target &&
      target !== document.body &&
      target !== document.documentElement &&
      !root.value?.contains(target)
    )
      return
    if (
      target?.isContentEditable ||
      target?.closest(
        'input, textarea, select, [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]',
      )
    )
      return

    // Preserve Home/End within a focused tab bar; arrow keys belong to playback.
    if (!event.shiftKey && target?.closest('[role="tab"]') && ['Home', 'End'].includes(event.key)) {
      const navigation = visibleNavigation().find((item) => item.root.value?.contains(target))
      if (!navigation) return
      event.preventDefault()
      navigation.move(event.key === 'Home' ? 'first' : 'last')
      return
    }

    for (const shortcut of lessonShortcuts) {
      if (shortcut.shift !== event.shiftKey) continue
      const binding = shortcut.bindings.find((item) => item.key === event.key)
      if (!binding) continue
      if (shortcut.level === 'playback') {
        // Space still activates ordinary buttons; a selected tab is a playback target.
        if (binding.action === 'toggle' && target?.closest('button:not([role="tab"]), a, summary'))
          return
        const controls = [...playbacks].reverse().find((item) => item.enabled?.() ?? true)
        if (!controls) return
        event.preventDefault()
        controls[binding.action as PlaybackAction]()
      } else {
        const navigation = visibleNavigation(shortcut.level)[0]
        if (!navigation) return
        event.preventDefault()
        navigation.move(binding.action === 'previous' ? -1 : 1, { focus: false })
      }
      return
    }
  }

  provide(lessonKeyboardKey, {
    registerPlayback(controls) {
      playbacks.add(controls)
      return () => {
        playbacks.delete(controls)
      }
    },
    registerNavigation(navigation) {
      navigations.add(navigation)
      return () => {
        navigations.delete(navigation)
      }
    },
    shortcuts,
  })
  onMounted(() => window.addEventListener('keydown', keydown))
  onScopeDispose(() => window.removeEventListener('keydown', keydown))
}

export function useLessonKeyboard() {
  const keyboard = inject(lessonKeyboardKey)
  if (!keyboard) throw new Error('Lesson keyboard controls require AlgorithmsModule.')
  return keyboard
}

export function useLessonPlayback(controls: LessonPlaybackControls) {
  onScopeDispose(useLessonKeyboard().registerPlayback(controls))
}

export function useLessonNavigation(navigation: LessonNavigation) {
  onScopeDispose(useLessonKeyboard().registerNavigation(navigation))
}

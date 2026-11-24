import { ref, shallowRef } from 'vue'

/** Applied inputs change live; the last custom input survives browsing examples. */
export function useInputPresets<Input>(
  initial: Input,
  presets: readonly Input[],
  copy: (input: Input) => Input,
) {
  const input = shallowRef(copy(initial))
  const currentInput = shallowRef(copy(initial))
  const activePreset = ref('custom')

  function apply(inputValue: Input) {
    input.value = copy(inputValue)
    currentInput.value = copy(inputValue)
    activePreset.value = 'custom'
  }

  function select(index: number) {
    const preset = presets[index]
    if (preset === undefined) return
    input.value = copy(preset)
    activePreset.value = String(index)
  }

  function restore() {
    input.value = copy(currentInput.value)
    activePreset.value = 'custom'
  }

  return { input, activePreset, apply, select, restore }
}

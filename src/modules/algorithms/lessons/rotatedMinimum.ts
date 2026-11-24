import { rotatedMinimumPseudocode } from '../domain/rotatedMinimum'
import type { LessonDefinition } from '../domain/lesson'
import type { BoundarySearchApproach } from '../domain/searchPresentation'

export const rotatedMinimumExamples = [
  { values: [30, 40, 50, 10, 20], answer: 3 },
  { values: [3, 5, 7, 11, 13, 17, 19, 2], answer: 7 },
] as const

export const rotatedMinimumPresets = [
  { values: rotatedMinimumExamples[0].values, label: 'Minimum · middle' },
  { values: rotatedMinimumExamples[1].values, label: 'Minimum · last' },
  { values: [1, 3, 5, 7], label: 'Minimum · first' },
  { values: [7], label: '1 item' },
  { values: [9, 2], label: '2 items · rotated' },
  { values: [2, 9], label: '2 items · sorted' },
  { values: [2, 6, -9, -5, -1], label: 'Negative values' },
] as const

export const rotatedMinimumApproach = {
  pattern: { label: 'Binary search', routeName: 'algorithms-pattern-binary-search' },
  variation: 'Boundary search',
  target: 'First value ≤ the fixed last value.',
  answerLabel: 'minimum',
  regions: ['> A[−1]', '≤ A[−1]'],
  steps: [
    { id: 'split', title: 'Split', detail: '' },
    { id: 'search', title: 'Search', detail: '' },
    { id: 'return', title: 'Return', detail: 'Saved index.' },
  ],
  cases: [
    { value: false, condition: 'A[mid] > A[−1]', action: 'Search right', direction: 'right' },
    {
      value: true,
      condition: 'A[mid] ≤ A[−1]',
      action: 'Search left',
      direction: 'left',
      save: 'Save mid',
    },
  ],
} as const satisfies BoundarySearchApproach

export const rotatedMinimumLesson = {
  id: 'binary-search-rotated-minimum',
  problem: {
    title: 'Find the minimum in a rotated array',
    description:
      'Given a non-empty sorted array of unique integers rotated at an unknown pivot, return the zero-based index of its minimum element.',
    examples: rotatedMinimumExamples.map(({ values, answer }) => ({
      input: 'arr = [' + values.join(', ') + ']',
      output: String(answer),
    })),
    source: {
      label: 'AlgoMonster',
      url: 'https://algo.monster/problems/min_in_rotated_sorted_array',
    },
  },
  steps: [
    {
      id: 'initialize',
      title: 'Initialize',
      description:
        'Search the full array. Set answer to −1 until a possible target is found. A[−1] always means the original last element.',
      instructions: ['bounds', 'answer'],
    },
    {
      id: 'compute',
      title: 'Compute the middle',
      description: 'While the range is nonempty, choose the middle index rounded down.',
      instructions: ['loop', 'midpoint'],
      explanations: [
        {
          instruction: 'loop',
          outcome: false,
          text: 'The range is empty. The saved index is the first element no greater than the fixed last value.',
        },
      ],
    },
    {
      id: 'check',
      title: 'Compare with last',
      description:
        'Test A[mid] ≤ A[−1]. This is false on the higher run and true from the target onward.',
      instructions: ['condition'],
      explanations: [
        {
          instruction: 'condition',
          outcome: true,
          text: 'mid may be the target. Save it, then check earlier indices.',
        },
        {
          instruction: 'condition',
          outcome: false,
          text: 'This value is above the fixed last value. The target must be to the right.',
        },
      ],
    },
    {
      id: 'narrow',
      title: 'Narrow the range',
      description:
        'Save mid and search left when the comparison is true. Otherwise search right. Keep the last-element comparison fixed.',
      instructions: ['save', 'right', 'else', 'left'],
      explanations: [
        {
          instruction: 'save',
          text: 'Save this index before moving the right bound. The target may be at an earlier index.',
        },
        {
          instruction: 'right',
          text: 'Search left for the first true comparison. A[−1] stays fixed even though right moves.',
        },
        {
          instruction: 'left',
          text: 'Skip mid and the higher values before it. They cannot be the target.',
        },
      ],
    },
    {
      id: 'finish',
      title: 'Return the index',
      description:
        'Return the saved zero-based index, not the element’s value. The Python solution calls this variable boundary_index.',
      instructions: ['return'],
    },
  ],
  repeat: {
    from: 'compute',
    through: 'narrow',
    label: 'Repeat steps 2–4 until the range is empty.',
  },
  complexity: { time: 'O(log n)', space: 'O(1)' },
  pseudocode: rotatedMinimumPseudocode,
  notes: [
    {
      title: 'Recognize the shape',
      text: 'The target is the minimum’s index. The array rises, drops at the target, then rises again. A rising pair can lie on either side of the target, so it gives no search direction. In an unrotated array, the target is index 0.',
    },
    {
      title: 'Use the fixed last element',
      text: 'A[mid] ≤ A[−1] forms a false → true boundary. Save mid as a possible target and continue left. If A[mid] > A[−1], search right. The comparison uses the original last element, never A[right].',
    },
    {
      title: 'Why include equality?',
      text: 'The target can be the last index. When mid reaches it, A[mid] equals A[−1]. ≤ saves the target; < rejects it. For a single-element array, the target is index 0.',
    },
    {
      title: 'Complexity',
      text: 'For n elements, each search step roughly halves the range: O(log n) time and O(1) auxiliary space, excluding the input array. The visualizer validates custom inputs and records playback snapshots separately from the search.',
    },
  ],
  solutions: [
    {
      title: 'Fixed last-element boundary',
      code: `def find_min_rotated(arr: list[int]) -> int:
    left, right = 0, len(arr) - 1
    boundary_index = -1

    while left <= right:
        mid = (left + right) // 2
        # Compare with the fixed last element of the array.
        if arr[mid] <= arr[-1]:
            boundary_index = mid
            right = mid - 1
        else:
            left = mid + 1

    return boundary_index


if __name__ == "__main__":
    arr = [int(x) for x in input().split()]
    res = find_min_rotated(arr)
    print(res)`,
    },
  ],
} as const satisfies LessonDefinition

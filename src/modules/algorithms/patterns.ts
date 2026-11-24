import { binarySearchPattern } from './patterns/binarySearch'

export const algorithmPatterns = [
  {
    id: binarySearchPattern.id,
    title: binarySearchPattern.title,
    summary: binarySearchPattern.summary,
    path: 'patterns/binary-search',
    routeName: 'algorithms-pattern-binary-search',
    component: () => import('./pages/BinarySearchPatternPage.vue'),
  },
]

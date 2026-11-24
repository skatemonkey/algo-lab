import { firstTrueLesson } from './lessons/firstTrue'
import { firstOccurrenceLesson } from './lessons/firstOccurrence'
import { firstNotSmallerLesson } from './lessons/firstNotSmaller'
import { squareRootLessons } from './lessons/squareRoot'
import { rotatedMinimumLesson } from './lessons/rotatedMinimum'
import { mountainPeakLesson } from './lessons/mountainPeak'
import {
  linkedListMiddleLesson,
  moveZerosLesson,
  removeDuplicatesLesson,
} from './lessons/twoPointers'

export const algorithmQuestions = [
  {
    id: firstTrueLesson.id,
    path: 'binary-search',
    routeName: 'binary-search',
    title: firstTrueLesson.problem.title,
    summary: 'Find the earliest true in a sorted boolean array.',
    patternId: 'binary-search',
    component: () => import('./pages/FirstTruePage.vue'),
  },
  {
    id: firstOccurrenceLesson.id,
    path: 'first-occurrence',
    routeName: 'first-occurrence',
    title: firstOccurrenceLesson.problem.title,
    summary: 'Find the earliest exact match in a sorted integer array.',
    patternId: 'binary-search',
    component: () => import('./pages/FirstOccurrencePage.vue'),
  },
  {
    id: firstNotSmallerLesson.id,
    path: 'first-not-smaller',
    routeName: 'first-not-smaller',
    title: firstNotSmallerLesson.problem.title,
    summary: 'Find the first value greater than or equal to the target.',
    patternId: 'binary-search',
    component: () => import('./pages/FirstNotSmallerPage.vue'),
  },
  {
    id: squareRootLessons.lower.id,
    path: 'square-root',
    routeName: 'square-root',
    title: squareRootLessons.lower.problem.title,
    summary: 'Find the integer square root using either boundary of the answer space.',
    patternId: 'binary-search',
    component: () => import('./pages/SquareRootPage.vue'),
  },
  {
    id: rotatedMinimumLesson.id,
    path: 'rotated-minimum',
    routeName: 'rotated-minimum',
    title: rotatedMinimumLesson.problem.title,
    summary: 'Find the minimum index by comparing with the fixed last element.',
    patternId: 'binary-search',
    component: () => import('./pages/RotatedMinimumPage.vue'),
  },
  {
    id: mountainPeakLesson.id,
    path: 'mountain-peak',
    routeName: 'mountain-peak',
    title: mountainPeakLesson.problem.title,
    summary: 'Find the peak by comparing each midpoint with its right neighbor.',
    patternId: 'binary-search',
    component: () => import('./pages/MountainPeakPage.vue'),
  },
  {
    id: removeDuplicatesLesson.id,
    path: 'remove-duplicates',
    routeName: 'remove-duplicates',
    title: removeDuplicatesLesson.problem.title,
    summary: 'Keep one copy of each value using two pointers.',
    patternId: null,
    component: () => import('./pages/RemoveDuplicatesPage.vue'),
  },
  {
    id: linkedListMiddleLesson.id,
    path: 'linked-list-middle',
    routeName: 'linked-list-middle',
    title: linkedListMiddleLesson.problem.title,
    summary: 'Find the middle with a slow pointer and a fast pointer.',
    patternId: null,
    component: () => import('./pages/LinkedListMiddlePage.vue'),
  },
  {
    id: moveZerosLesson.id,
    path: 'move-zeros',
    routeName: 'move-zeros',
    title: moveZerosLesson.problem.title,
    summary: 'Move zeros to the end while keeping nonzero values in order.',
    patternId: null,
    component: () => import('./pages/MoveZerosPage.vue'),
  },
]

import type { RouteRecordRaw } from 'vue-router'
import { algorithmQuestions } from './questions'
import { algorithmPatterns } from './patterns'

export const algorithmRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./AlgorithmsModule.vue'),
    children: [
      {
        path: '',
        name: 'algorithms',
        component: () => import('./pages/AlgorithmsPage.vue'),
        meta: { title: 'Algorithms' },
      },
      {
        path: 'design',
        name: 'design',
        component: () => import('./pages/DesignPage.vue'),
        meta: { title: 'Design Playground' },
      },
      ...[...algorithmQuestions, ...algorithmPatterns].map((entry) => ({
        path: entry.path,
        name: entry.routeName,
        component: entry.component,
        meta: { title: entry.title },
      })),
    ],
  },
]

import { createRouter, createWebHistory } from 'vue-router'
import { algorithmRoutes } from '@/modules/algorithms/routes'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...algorithmRoutes, { path: '/:pathMatch(.*)*', redirect: { name: 'algorithms' } }],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title} · Algo Lab`
})

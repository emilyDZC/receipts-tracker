import { createRouter, createWebHistory } from 'vue-router'
import ReceiptList from '@/components/ReceiptList.vue'
import ReceiptCapture from '@/components/ReceiptCapture.vue'
import AuthForm from '@/components/AuthForm.vue'
import { getAuth } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ReceiptList,
      meta: { requiresAuth: true },
    },
    {
      path: '/add',
      name: 'add',
      component: ReceiptCapture,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: AuthForm,
    },
  ],
})

// Simplified navigation guard
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const user = auth.currentUser

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/')
  } else {
    next()
  }
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import ReceiptList from '@/components/ReceiptList.vue'
import ReceiptCapture from '@/components/ReceiptCapture.vue'
import AuthForm from '@/components/AuthForm.vue'
import { user, loading } from '@/composables/useAuth'

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

// Navigation guard
router.beforeEach((to, from, next) => {
  // Wait for auth to initialize
  const checkAuth = () => {
    if (loading.value) {
      setTimeout(checkAuth, 50)
      return
    }

    if (to.meta.requiresAuth && !user.value) {
      next('/login')
    } else if (to.path === '/login' && user.value) {
      next('/')
    } else {
      next()
    }
  }

  checkAuth()
})

export default router
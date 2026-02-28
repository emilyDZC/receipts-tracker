import { createRouter, createWebHistory } from 'vue-router'
import ReceiptList from '@/components/ReceiptList.vue'
import ReceiptCapture from '@/components/ReceiptCapture.vue'
import ReceiptDetail from '@/components/ReceiptDetail.vue'
import CalculateJourney from '@/components/CalculateJourney.vue'
import AuthForm from '@/components/AuthForm.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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
      path: '/add-journey',
      name: 'add-journey',
      component: CalculateJourney,
      meta: { requiresAuth: true },
    },
    {
      path: '/receipt/:id',
      name: 'receipt-detail',
      component: ReceiptDetail,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: AuthForm,
    },
  ],
})

// Better navigation guard that waits for auth to be ready
let authReady = false
const auth = getAuth()

onAuthStateChanged(auth, () => {
  authReady = true
})

router.beforeEach((to, from, next) => {
  // Wait for auth to initialize on first load
  if (!authReady) {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      authReady = true

      if (to.meta.requiresAuth && !user) {
        next('/login')
        return
      } else if (to.path === '/login' && user) {
        next('/')
        return
      } else {
        next()
        return
      }
    })
  } else {
    const user = auth.currentUser

    if (to.meta.requiresAuth && !user) {
      next('/login')
      return
    } else if (to.path === '/login' && user) {
      next('/')
      return
    } else {
      next()
      return
    }
  }
})

export default router
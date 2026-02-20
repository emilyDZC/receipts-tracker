import { createRouter, createWebHistory } from 'vue-router'
import ReceiptList from '@/components/ReceiptList.vue'
import ReceiptCapture from '@/components/ReceiptCapture.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ReceiptList,
    },
    {
      path: '/add',
      name: 'add',
      component: ReceiptCapture,
    },
  ],
})

export default router
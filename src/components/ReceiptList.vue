<template>
  <div class="max-w-md mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Receipts</h1>
      <div class="relative" v-click-outside="closeMenu">
        <!-- burger button + dropdown -->
        <div class="relative">
          <button
            @click="toggleMenu"
            class="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition"
            aria-label="Open menu"
            aria-haspopup="menu"
            :aria-expanded="isMenuOpen ? 'true' : 'false'"
          >
            <!-- burger icon -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            v-if="isMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
            role="menu"
          >
            <!-- Links you can add later -->
            <router-link
              to="/stats"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              role="menuitem"
              @click="closeMenu"
            >
              Stats
            </router-link>

            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              role="menuitem"
              @click="closeMenu"
            >
              Settings
            </router-link>

            <div class="border-t border-gray-200"></div>

            <button
              @click="handleLogoutFromMenu"
              class="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <router-link 
          to="/add"
          class="w-full sm:flex-1 bg-teal-600 text-white px-6 py-8 rounded-md hover:bg-teal-700 transition text-center text-xl font-semibold"
        >
          + Receipt
        </router-link>
        <router-link 
          to="/add-journey"
          class="w-full sm:flex-1 bg-indigo-500 text-white px-6 py-8 rounded-md hover:bg-indigo-700 transition text-center text-xl font-semibold"
        >
          🚗 Journey
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else-if="receipts.length === 0" class="text-center py-8">
      <p class="text-gray-900">No receipts yet. Add your first one!</p>
    </div>

    <div v-else class="space-y-4">
      <router-link
        v-for="receipt in receipts" 
        :key="receipt.id"
        :to="`/receipt/${receipt.id}`"
        class="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition cursor-pointer block"
      >
        <img 
          :src="receipt.imageUrl" 
          :alt="receipt.merchant"
          class="w-20 h-20 object-cover rounded flex-shrink-0"
        >
        <div class="flex-1">
          <h3 class="text-gray-600 font-semibold text-lg">{{ receipt.merchant }}</h3>
          <p class="text-2xl font-bold text-teal-600">£{{ receipt.amount.toFixed(2) }}</p>
          <p class="text-sm text-gray-600">{{ receipt.category }}</p>
          <p class="text-xs text-gray-500">{{ formatDate(receipt.date) }}</p>
        </div>
        <div class="flex items-center text-gray-400">
          <span class="text-xl">›</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useReceipts } from '@/composables/useReceipts'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { receipts, loading, error, fetchReceipts } = useReceipts()
const { logOut } = useAuth()

onMounted(() => {
  fetchReceipts()
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const handleLogout = async () => {
  try {
    await logOut()
    router.push('/login')
  } catch (err) {
    alert('Error logging out: ' + err.message)
  }
}

const isMenuOpen = ref(false)

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Close on Escape
const onKeyDown = (e) => {
  if (e.key === 'Escape') closeMenu()
}

window.addEventListener('keydown', onKeyDown)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))

const handleLogoutFromMenu = async () => {
  closeMenu()
  await handleLogout()
}
</script>
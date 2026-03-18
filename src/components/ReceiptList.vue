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
    <div class="flex justify-between items-center">
      <div class="flex gap-2 w-full mb-4">
        <router-link 
          to="/add"
          class="flex-1 bg-teal-600 text-white px-4 py-8 rounded-md hover:bg-teal-700 transition text-center text-xl font-semibold"
        >
          + Receipt
        </router-link>
        <router-link 
          to="/add-journey"
          class="flex-1 bg-indigo-500 text-white px-4 py-8 rounded-md hover:bg-indigo-700 transition text-center text-xl font-semibold"
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
      <ReceiptCard
        v-for="receipt in receipts"
        :key="receipt.id"
        :receipt="receipt"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onBeforeUnmount, computed } from 'vue'
import { useReceipts } from '@/composables/useReceipts'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import ReceiptCard from '@/components/ReceiptCard.vue'

const router = useRouter()
const { receipts, loading, error, fetchReceipts } = useReceipts()
const { logOut } = useAuth()

onMounted(() => {
  fetchReceipts()
})

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

// -------- Grouping logic ------------- //

const expandedMonths = ref(new Set())

const toggleMonth = (key) => {
  const next = new Set(expandedMonths.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedMonths.value = next
}

const isMonthExpanded = (key) => expandedMonths.value.has(key)

const pad2 = (n) => String(n).padStart(2, '0')
const monthKeyFromDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
const currentMonthKey = monthKeyFromDate(new Date())

// TODO: adjust this to your actual receipt date field
const getReceiptDate = (r) => {
  // Prefer explicit receipt date, fall back to createdAt
  const raw = r.date ?? r.createdAt
  if (!raw) return null

  // If Firestore Timestamp, it may have toDate()
  if (typeof raw === 'object' && typeof raw.toDate === 'function') return raw.toDate()

  // ISO or YYYY-MM-DD
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

const receiptsWithMonth = computed(() => {
  return (receipts.value || [])
    .map((r) => {
      const d = getReceiptDate(r)
      return {
        ...r,
        __date: d,
        __monthKey: d ? monthKeyFromDate(d) : 'unknown',
      }
    })
})

const currentMonthReceipts = computed(() => {
  return receiptsWithMonth.value
    .filter((r) => r.__monthKey === currentMonthKey)
    .sort((a, b) => (b.__date?.getTime() || 0) - (a.__date?.getTime() || 0))
})

const previousMonthGroups = computed(() => {
  const map = new Map()

  for (const r of receiptsWithMonth.value) {
    if (r.__monthKey === currentMonthKey) continue
    const key = r.__monthKey
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(r)
  }

  const groups = Array.from(map.entries()).map(([key, list]) => {
    const total = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const count = list.length

    // label like "February 2026"
    let label = key
    if (key !== 'unknown') {
      const [y, m] = key.split('-')
      const dateForLabel = new Date(Number(y), Number(m) - 1, 1)
      label = dateForLabel.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    }

    list.sort((a, b) => (b.__date?.getTime() || 0) - (a.__date?.getTime() || 0))

    return { key, label, total, count, receipts: list }
  })

  // newest month first; keep "unknown" at the end
  groups.sort((a, b) => {
    if (a.key === 'unknown') return 1
    if (b.key === 'unknown') return -1
    return b.key.localeCompare(a.key)
  })

  return groups
})
</script>
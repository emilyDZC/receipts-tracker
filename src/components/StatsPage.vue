<template>
  <div class="max-w-md mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <BackButton />
      <h1 class="text-3xl font-bold">Stats</h1>
      <div class="w-[72px]"></div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Totals by category</h2>
        <button
          @click="refresh"
          class="text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div v-if="loading" class="text-gray-600 text-sm">Loading…</div>
      <div v-else-if="error" class="text-red-700 text-sm">{{ error }}</div>

      <div v-else>
        <div v-if="categoryTotals.length === 0" class="text-gray-600 text-sm">
          No receipts yet.
        </div>

        <div v-else class="space-y-3">
            <div class="mb-4 p-3 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <div class="text-sm font-semibold text-indigo-900">Mileage cost total</div>
            <div class="text-sm font-bold text-indigo-900">£{{ mileageTotal.toFixed(2) }}</div>
         </div>
          <div
            v-for="row in categoryTotals"
            :key="row.category"
            class="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2"
          >
            <div class="text-sm font-medium text-gray-800">
              {{ row.category }}
            </div>
            <div class="text-sm font-semibold text-gray-900">
              £{{ row.total.toFixed(2) }}
            </div>
          </div>

        <div v-if="journeysError" class="text-red-700 text-sm mb-4">
            {{ journeysError }}
        </div>

          <div class="border-t border-gray-200 pt-3 space-y-2">
            <div class="flex items-center justify-between">
                <div class="text-sm font-semibold">Receipts total</div>
                <div class="text-sm font-bold">£{{ grandTotal.toFixed(2) }}</div>
            </div>

            <div class="flex items-center justify-between">
                <div class="text-sm font-semibold">Mileage total</div>
                <div class="text-sm font-bold">£{{ mileageTotal.toFixed(2) }}</div>
            </div>

            <div class="flex items-center justify-between border-t border-gray-200 pt-2">
                <div class="text-sm font-extrabold">Grand total</div>
                <div class="text-sm font-extrabold">£{{ combinedGrandTotal.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { useReceipts } from '@/composables/useReceipts'
import { useJourneys } from '@/composables/useJourneys'

const { receipts, loading, error, fetchReceipts } = useReceipts()

const {
  journeys,
  loading: journeysLoading,
  error: journeysError,
  fetchJourneys
} = useJourneys()

onMounted(async () => {
  if (!receipts.value || receipts.value.length === 0) {
    await fetchReceipts()
  }
  if (!journeys.value || journeys.value.length === 0) {
    await fetchJourneys()
  }
})

const refresh = async () => {
  await Promise.all([fetchReceipts(), fetchJourneys()])
}

const categoryTotals = computed(() => {
  const map = new Map()

  for (const r of receipts.value || []) {
    const category = (r.category || 'Uncategorized').trim()
    const amount = Number(r.amount) || 0
    map.set(category, (map.get(category) || 0) + amount)
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
})

const grandTotal = computed(() => {
  return categoryTotals.value.reduce((sum, row) => sum + row.total, 0)
})

const mileageTotal = computed(() => {
  return (journeys.value || []).reduce((sum, j) => {
    // prefer totalCost if present; fall back to cost; coerce strings to number
    const raw = j.totalCost ?? j.cost ?? 0
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.]/g, ''))
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
})

const combinedGrandTotal = computed(() => {
  return grandTotal.value + mileageTotal.value
})
</script>
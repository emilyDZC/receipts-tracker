<template>
  <div class="max-w-md mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <BackButton />
      <h1 class="text-3xl font-bold">Stats</h1>
      <div class="w-[72px]"></div>
    </div>

    <!-- Loading state -->
    <div v-if="taxYearLoading" class="bg-white rounded-lg shadow-md p-6">
      <p class="text-sm text-gray-600">Loading tax year settings...</p>
    </div>

    <!-- No settings configured yet -->
    <div v-else-if="!taxYearSettings" class="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
      <h2 class="text-lg font-semibold text-blue-900 mb-2">Tax year not configured</h2>
      <p class="text-sm text-blue-800 mb-4">
        Before viewing stats by tax year, you need to configure your tax year settings.
      </p>
      <router-link
        to="/settings"
        class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
      >
        Go to Settings
      </router-link>
    </div>

    <div v-else>
      <!-- Current Tax Year (always expanded) -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">{{ currentTaxYearKey }} (Current)</h2>
          <button
            @click="refresh"
            class="text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        <div v-if="loading" class="text-gray-600 text-sm">Loading…</div>
        <div v-else-if="error || journeysError" class="text-red-700 text-sm">
          {{ error || journeysError }}
        </div>

        <div v-else>
          <TaxYearStats :stats="currentYearStats" />
        </div>
      </div>

      <!-- Previous Tax Years (collapsible) -->
      <div v-if="previousYearGroups.length > 0" class="space-y-3">
        <h2 class="text-sm font-semibold text-gray-600 mb-2">Previous tax years</h2>

        <div
          v-for="group in previousYearGroups"
          :key="group.key"
          class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
        >
          <button
            type="button"
            class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
            @click="toggleYear(group.key)"
          >
            <div class="text-left">
              <div class="font-semibold">{{ group.key }}</div>
              <div class="text-xs text-gray-600">
                Grand total: £{{ group.stats.combinedGrandTotal.toFixed(2) }}
              </div>
            </div>

            <div class="text-gray-400">
              {{ isYearExpanded(group.key) ? '▲' : '▼' }}
            </div>
          </button>

          <div v-if="isYearExpanded(group.key)" class="border-t border-gray-100 p-6">
            <TaxYearStats :stats="group.stats" />
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="text-sm text-gray-600 mt-4">
        No previous tax years yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BackButton from '@/components/BackButton.vue'
import TaxYearStats from '@/components/TaxYearStats.vue'
import { useReceipts } from '@/composables/useReceipts'
import { useJourneys } from '@/composables/useJourneys'
import { useTaxYearSettings } from '@/composables/useTaxYearSettings'

const { receipts, loading, error, fetchReceipts } = useReceipts()
const {
  journeys,
  loading: journeysLoading,
  error: journeysError,
  fetchJourneys
} = useJourneys()

const {
  settings: taxYearSettings,
  loading: taxYearLoading,
  fetchSettings,
  getTaxYear,
  currentTaxYearKey,
} = useTaxYearSettings()

const expandedYears = ref(new Set())

onMounted(async () => {
  await fetchSettings()
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

const toggleYear = (key) => {
  const next = new Set(expandedYears.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedYears.value = next
}

const isYearExpanded = (key) => expandedYears.value.has(key)

// Helper to get date from receipt
const getReceiptDate = (r) => {
  const raw = r.date ?? r.createdAt
  if (!raw) return null
  if (typeof raw === 'object' && typeof raw.toDate === 'function') return raw.toDate()
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

// Helper to get date from journey
const getJourneyDate = (j) => {
  const raw = j.date ?? j.createdAt
  if (!raw) return null
  if (typeof raw === 'object' && typeof raw.toDate === 'function') return raw.toDate()
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

// Group receipts and journeys by tax year
const dataByTaxYear = computed(() => {
  if (!taxYearSettings.value) return new Map()

  const map = new Map()

  // Group receipts
  for (const r of receipts.value || []) {
    const date = getReceiptDate(r)
    const key = getTaxYear(date, taxYearSettings.value)
    if (!map.has(key)) {
      map.set(key, { receipts: [], journeys: [] })
    }
    map.get(key).receipts.push(r)
  }

  // Group journeys
  for (const j of journeys.value || []) {
    const date = getJourneyDate(j)
    const key = getTaxYear(date, taxYearSettings.value)
    if (!map.has(key)) {
      map.set(key, { receipts: [], journeys: [] })
    }
    map.get(key).journeys.push(j)
  }

  return map
})

// Calculate stats for a specific tax year
const calculateStats = (receipts, journeys) => {
  const categoryMap = new Map()

  for (const r of receipts || []) {
    const category = (r.category || 'Uncategorized').trim()
    const amount = Number(r.amount) || 0
    categoryMap.set(category, (categoryMap.get(category) || 0) + amount)
  }

  const categoryTotals = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const grandTotal = categoryTotals.reduce((sum, row) => sum + row.total, 0)

  const mileageTotal = (journeys || []).reduce((sum, j) => {
    const raw = j.totalCost ?? j.cost ?? 0
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^0-9.]/g, ''))
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)

  const combinedGrandTotal = grandTotal + mileageTotal

  return {
    categoryTotals,
    grandTotal,
    mileageTotal,
    combinedGrandTotal,
  }
}

// Current tax year stats
const currentYearStats = computed(() => {
  const data = dataByTaxYear.value.get(currentTaxYearKey.value)
  if (!data) {
    return {
      categoryTotals: [],
      grandTotal: 0,
      mileageTotal: 0,
      combinedGrandTotal: 0,
    }
  }
  return calculateStats(data.receipts, data.journeys)
})

// Previous tax years
const previousYearGroups = computed(() => {
  const groups = []

  for (const [key, data] of dataByTaxYear.value.entries()) {
    if (key === currentTaxYearKey.value || key === 'unknown') continue

    const stats = calculateStats(data.receipts, data.journeys)
    groups.push({ key, stats })
  }

  // Sort by key descending (most recent first)
  groups.sort((a, b) => b.key.localeCompare(a.key))

  return groups
})
</script>
<template>
  <div>
    <div v-if="stats.categoryTotals.length === 0 && stats.mileageTotal === 0" class="text-gray-600 text-sm">
      No receipts or journeys for this period.
    </div>

    <div v-else class="space-y-3">
      <div class="mb-4 p-3 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-between">
        <div class="text-sm font-semibold text-indigo-900">Mileage cost total</div>
        <div class="text-sm font-bold text-indigo-900">£{{ stats.mileageTotal.toFixed(2) }}</div>
      </div>

      <div
        v-for="row in stats.categoryTotals"
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

      <div class="border-t border-gray-200 pt-3 space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold">Receipts total</div>
          <div class="text-sm font-bold">£{{ stats.grandTotal.toFixed(2) }}</div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold">Mileage total</div>
          <div class="text-sm font-bold">£{{ stats.mileageTotal.toFixed(2) }}</div>
        </div>

        <div class="flex items-center justify-between border-t border-gray-200 pt-2">
          <div class="text-sm font-extrabold">Grand total</div>
          <div class="text-sm font-extrabold">£{{ stats.combinedGrandTotal.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
  }
})
</script>
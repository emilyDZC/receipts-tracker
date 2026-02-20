<template>
  <div class="max-w-md mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Receipts</h1>
      <router-link 
        to="/add"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        + Add
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Loading...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else-if="receipts.length === 0" class="text-center py-8">
      <p class="text-gray-600">No receipts yet. Add your first one!</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="receipt in receipts" 
        :key="receipt.id"
        class="bg-white rounded-lg shadow-md p-4 flex gap-4"
        >
        <img 
            :src="receipt.imageUrl" 
            :alt="receipt.merchant"
            class="w-20 h-20 object-cover rounded flex-shrink-0"
        >
        <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ receipt.merchant }}</h3>
            <p class="text-2xl font-bold text-blue-600">${{ receipt.amount.toFixed(2) }}</p>
            <p class="text-sm text-gray-600">{{ receipt.category }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(receipt.date) }}</p>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useReceipts } from '@/composables/useReceipts'

const { receipts, loading, error, fetchReceipts } = useReceipts()

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
</script>
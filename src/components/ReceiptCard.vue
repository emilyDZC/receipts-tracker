<template>
  <router-link
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
      <p class="text-2xl font-bold text-teal-600">
        £{{ Number(receipt.amount).toFixed(2) }}
      </p>
      <p class="text-sm text-gray-600">{{ receipt.category }}</p>
      <p class="text-xs text-gray-500">{{ formatDate(receipt.date) }}</p>
    </div>

    <div class="flex items-center text-gray-400">
      <span class="text-xl">›</span>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({
  receipt: {
    type: Object,
    required: true,
  },
})

// Keep it local so ReceiptList doesn’t have to pass formatDate around
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return String(dateString)
  return date.toLocaleDateString('en-GB')
}
</script>
<template>
  <div class="max-w-md mx-auto p-4">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-4">Add Receipt</h2>
      
      <!-- Image Preview -->
      <div v-if="imagePreview" class="mb-4">
        <img :src="imagePreview" alt="Receipt preview" class="w-full rounded-lg">
        <button 
          @click="clearImage"
          class="mt-2 text-red-600 text-sm"
        >
          Remove Image
        </button>
      </div>

      <!-- Camera/Upload Input -->
      <div v-else class="mb-4">
        <label class="block w-full">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">Tap to take photo or upload</p>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            @change="handleImageSelect"
            class="hidden"
          >
        </label>
      </div>

      <!-- Receipt Details Form -->
      <form @submit.prevent="handleSubmit" v-if="imageFile">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
            <input 
              v-model="formData.merchant" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Coffee Shop"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              v-model.number="formData.amount" 
              type="number" 
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              v-model="formData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Food & Drink</option>
              <option>Groceries</option>
              <option>Transportation</option>
              <option>Shopping</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              v-model="formData.date" 
              type="date" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea 
              v-model="formData.notes" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional details..."
            ></textarea>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {{ loading ? 'Saving...' : 'Save Receipt' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useReceipts } from '@/composables/useReceipts'
import { useRouter } from 'vue-router'

const router = useRouter()
const { addReceipt, loading } = useReceipts()

const imageFile = ref(null)
const imagePreview = ref(null)

const formData = ref({
  merchant: '',
  amount: '',
  category: 'Food & Drink',
  date: new Date().toISOString().split('T')[0],
  notes: ''
})

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  imageFile.value = null
  imagePreview.value = null
}

const handleSubmit = async () => {
  try {
    await addReceipt(imageFile.value, formData.value)
    alert('Receipt saved successfully!')
    router.push('/')
  } catch (err) {
    alert('Error saving receipt: ' + err.message)
  }
}
</script>
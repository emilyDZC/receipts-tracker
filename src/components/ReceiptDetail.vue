<template>
  <div class="max-w-md mx-auto p-4">
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- Header with Back and Delete buttons -->
      <div class="flex justify-between items-center mb-4">
        <button 
          @click="router.push('/')"
          class="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        <button 
          @click="handleDelete"
          class="text-red-600 hover:text-red-800"
        >
          🗑️ Delete
        </button>
      </div>

      <div v-if="!receipt" class="text-center py-8">
        <p class="text-gray-600">Loading...</p>
      </div>

      <div v-else>
        <!-- Image with replace option -->
        <div class="mb-4">
          <img 
            :src="receipt.imageUrl" 
            alt="Receipt" 
            class="w-full h-64 object-contain rounded-lg border border-gray-300 mb-2"
          >
          <label class="block">
            <span class="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
              📷 Replace Photo
            </span>
            <input 
              type="file" 
              accept="image/*" 
              @change="handleImageReplace"
              class="hidden"
            >
          </label>
        </div>

        <!-- Edit Form -->
        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
            <input 
              v-model="formData.merchant" 
              type="text" 
              required
              :disabled="!isEditing"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              ]"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              v-model.number="formData.amount" 
              type="number" 
              step="0.01"
              required
              :disabled="!isEditing"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              ]"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              v-model="formData.category"
              :disabled="!isEditing"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              ]"
            >
              <option>Subsistence</option>
              <option>Transportation</option>
              <option>Accommodation</option>
              <option>Stage Attire</option>
              <option>Small Equipment & Maintenance</option>
              <option>Insurance</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              v-model="formData.date" 
              type="date" 
              required
              :disabled="!isEditing"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              ]"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              v-model="formData.notes" 
              rows="3"
              :disabled="!isEditing"
              :class="[
                'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                !isEditing && 'bg-gray-50'
              ]"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button 
              v-if="!isEditing"
              type="button"
              @click="isEditing = true"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Edit
            </button>
            <template v-else>
              <button 
                type="button"
                @click="cancelEdit"
                class="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                :disabled="loading"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {{ loading ? 'Saving...' : 'Save' }}
              </button>
            </template>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReceipts } from '@/composables/useReceipts'
import { compressImage } from '@/utils/imageCompression'

const router = useRouter()
const route = useRoute()
const { loading, fetchReceipt, deleteReceipt, updateReceipt, replaceReceiptImage } = useReceipts()

const isEditing = ref(false)
const receiptId = route.params.id
const receipt = ref(null)

const formData = ref({
  merchant: '',
  amount: '',
  category: '',
  date: '',
  notes: ''
})

// Load receipt on mount
onMounted(async () => {
  try {
    receipt.value = await fetchReceipt(receiptId)
    formData.value = {
      merchant: receipt.value.merchant,
      amount: receipt.value.amount,
      category: receipt.value.category,
      date: receipt.value.date,
      notes: receipt.value.notes || ''
    }
  } catch (err) {
    alert('Error loading receipt: ' + err.message)
    router.push('/')
  }
})

const cancelEdit = () => {
  isEditing.value = false
  // Reset form data
  if (receipt.value) {
    formData.value = {
      merchant: receipt.value.merchant,
      amount: receipt.value.amount,
      category: receipt.value.category,
      date: receipt.value.date,
      notes: receipt.value.notes || ''
    }
  }
}

const handleUpdate = async () => {
  try {
    await updateReceipt(receiptId, formData.value)
    // Update local receipt object
    receipt.value = { ...receipt.value, ...formData.value }
    isEditing.value = false
    alert('Receipt updated!')
  } catch (err) {
    alert('Error updating receipt: ' + err.message)
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this receipt?')) {
    return
  }

  try {
    await deleteReceipt(receiptId, receipt.value.imageUrl)
    alert('Receipt deleted!')
    router.push('/')
  } catch (err) {
    alert('Error deleting receipt: ' + err.message)
  }
}

const handleImageReplace = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!confirm('Replace this photo?')) {
    event.target.value = '' // Reset file input
    return
  }

  try {
    const compressedFile = await compressImage(file, 800, 0.8)
    const newImageUrl = await replaceReceiptImage(receiptId, receipt.value.imageUrl, compressedFile)
    // Update local receipt object
    receipt.value.imageUrl = newImageUrl
    alert('Photo replaced!')
  } catch (err) {
    alert('Error replacing photo: ' + err.message)
  }
}
</script>
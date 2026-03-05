<template>
  <div class="max-w-md mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <BackButton />
      <h1 class="text-3xl font-bold">Settings</h1>
      <div class="w-[72px]"></div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold mb-4">Saved locations</h2>

      <!-- Add new -->
      <form @submit.prevent="handleAdd" class="space-y-3 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
          <input
            v-model="newLabel"
            type="text"
            placeholder="e.g. Home"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address / place</label>
          <input
            v-model="newAddress"
            type="text"
            placeholder="e.g. 10 Downing Street, London"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <p class="text-xs text-gray-500 mt-1">
            Tip: can be a place name (“MediaCity”) or the first line of an address.
          </p>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
        >
          {{ loading ? 'Saving…' : 'Add location' }}
        </button>
      </form>

      <div v-if="error" class="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
        {{ error }}
      </div>

      <!-- List -->
      <div v-if="loading && locations.length === 0" class="text-sm text-gray-600">
        Loading…
      </div>

      <div v-else-if="locations.length === 0" class="text-sm text-gray-600">
        No saved locations yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="loc in locations"
          :key="loc.id"
          class="border border-gray-200 rounded-md p-3"
        >
          <div v-if="editingId !== loc.id" class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="font-semibold text-sm text-gray-900">
                {{ loc.label }}
              </div>
              <div class="text-sm text-gray-600 break-words">
                {{ loc.address }}
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="startEdit(loc)"
                class="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                @click="handleDelete(loc.id)"
                class="text-sm px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Label</label>
              <input
                v-model="editLabel"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Address / place</label>
              <input
                v-model="editAddress"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>

            <div class="flex gap-2">
              <button
                @click="cancelEdit"
                type="button"
                class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                @click="saveEdit(loc.id)"
                type="button"
                :disabled="loading"
                class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition"
              >
                Save
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { useLocations } from '@/composables/useLocations'

const { locations, loading, error, fetchLocations, addLocation, updateLocation, deleteLocation } = useLocations()

const newLabel = ref('')
const newAddress = ref('')

const editingId = ref(null)
const editLabel = ref('')
const editAddress = ref('')

onMounted(() => {
  fetchLocations()
})

const handleAdd = async () => {
  await addLocation({ label: newLabel.value, address: newAddress.value })
  newLabel.value = ''
  newAddress.value = ''
  // optional: refetch to re-apply sorting (esp “Home” top)
  await fetchLocations()
}

const startEdit = (loc) => {
  editingId.value = loc.id
  editLabel.value = loc.label || ''
  editAddress.value = loc.address || ''
}

const cancelEdit = () => {
  editingId.value = null
  editLabel.value = ''
  editAddress.value = ''
}

const saveEdit = async (id) => {
  await updateLocation(id, {
    label: editLabel.value,
    address: editAddress.value,
  })
  cancelEdit()
  await fetchLocations()
}

const handleDelete = async (id) => {
  if (!confirm('Delete this location?')) return
  await deleteLocation(id)
}
</script>
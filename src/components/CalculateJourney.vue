<template>
  <div class="max-w-md mx-auto p-4">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Calculate Journey</h1>
        <button @click="router.push('/')" class="text-gray-600 hover:text-gray-800">✕</button>
      </div>

      <!-- Journey Form -->
      <form @submit.prevent="handleCalculate" class="space-y-4">
        <div>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Starting Point
  </label>

  <div class="flex gap-2">
    <input
      v-model="origin"
      type="text"
      required
      placeholder="e.g. Birmingham Symphony Hall"
      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >

    <select
      v-model="selectedOriginLocationId"
      class="w-28 px-2 py-2 border border-gray-300 rounded-md bg-white text-sm"
      title="Use saved location"
    >
      <option value="">Use saved</option>
      <option
        v-for="loc in locations"
        :key="loc.id"
        :value="loc.id"
      >
        {{ loc.label }}
      </option>
    </select>

    <button
      v-if="homeLocation"
      type="button"
      @click="setOriginHome"
      class="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
      title="Set start to Home"
    >
      Home
    </button>
  </div>
</div>

       <div>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Destination
  </label>

  <div class="flex gap-2">
    <input
      v-model="destination"
      type="text"
      required
      placeholder="e.g. MediaCity"
      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >

    <select
      v-model="selectedDestinationLocationId"
      class="w-28 px-2 py-2 border border-gray-300 rounded-md bg-white text-sm"
      title="Use saved location"
    >
      <option value="">Use saved</option>
      <option
        v-for="loc in locations"
        :key="loc.id"
        :value="loc.id"
      >
        {{ loc.label }}
      </option>
    </select>

    <button
      v-if="homeLocation"
      type="button"
      @click="setDestinationHome"
      class="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
      title="Set destination to Home"
    >
      Home
    </button>
  </div>
</div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Work / Orchestra</label>
          <input
            v-model="work"
            type="text"
            placeholder="e.g. CBSO"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Journey date</label>
            <input
              v-model="journeyDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mileage rate (£/mile)</label>
            <input
              v-model.number="mileageRate"
              type="number"
              step="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <p class="text-xs text-gray-500 mt-1">HMRC: £0.45/mile</p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {{ loading ? 'Calculating...' : 'Calculate' }}
        </button>
      </form>

      <!-- Results / Save -->
      <div v-if="result" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <h3 class="font-semibold text-lg mb-2">Journey details</h3>

        <div class="space-y-1 text-sm">
          <p><span class="font-medium">One-way distance:</span> {{ result.distanceMiles }} miles</p>
          <p><span class="font-medium">One-way cost:</span> £{{ result.oneWayCost }}</p>

          <p v-if="isReturn"><span class="font-medium">Return distance:</span> {{ result.totalDistanceMiles }} miles</p>
          <p v-if="isReturn"><span class="font-medium">Return total cost:</span> £{{ result.totalCost }}</p>

          <p v-if="result.duration" class="text-gray-600">
            <span class="font-medium">Duration (one-way):</span> {{ formatDuration(result.duration) }}
          </p>
        </div>

        <div class="mt-4 space-y-3">
          <label class="flex items-center gap-2 text-sm">
            <input v-model="isReturn" type="checkbox" class="h-4 w-4">
            <span>Return?</span>
          </label>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input
              v-model="notes"
              type="text"
              placeholder="e.g. Client meeting"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
          </div>

          <button
            @click="handleSave"
            :disabled="loading"
            class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition text-sm"
          >
            Save journey
          </button>
        </div>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
        {{ error }}
      </div>
    </div>

    <!-- Toggle + Journey history -->
    <div class="mt-6">
      <button
        @click="showJourneys = !showJourneys"
        class="w-full bg-white rounded-lg shadow-md p-4 text-left flex justify-between items-center"
      >
        <span class="font-semibold">Show journeys</span>
        <span class="text-gray-400 text-xl">{{ showJourneys ? '−' : '+' }}</span>
      </button>

      <div v-if="showJourneys" class="mt-3 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Recent journeys</h2>

        <div v-if="journeys.length === 0" class="text-center py-4 text-gray-500 text-sm">
          No journeys saved yet
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="journey in journeys"
            :key="journey.id"
            class="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            <div class="flex justify-between items-start gap-2">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">
                  {{ journey.origin }} → {{ journey.destination }}
                  <span v-if="journey.isReturn" class="text-gray-500">(return)</span>
                </p>

                <p class="text-xs text-gray-600 mt-1">
                  {{ journey.journeyDate }} •
                  {{ journey.totalDistanceMiles ?? journey.distanceMiles }} miles •
                  £{{ journey.totalCost ?? journey.cost }}
                </p>

                <p v-if="journey.work" class="text-xs text-gray-500 mt-1">{{ journey.work }}</p>

                <p v-if="journey.notes" class="text-xs text-gray-500 mt-1">{{ journey.notes }}</p>
              </div>

              <button
                @click="handleDelete(journey.id)"
                class="text-red-500 hover:text-red-700 text-sm"
                title="Delete journey"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJourneys } from '@/composables/useJourneys'
import { useLocations } from '@/composables/useLocations'

const router = useRouter()
const { journeys, loading, error, calculateRoute, fetchJourneys, saveJourney, deleteJourney } = useJourneys()

const { locations, fetchLocations } = useLocations()
const selectedOriginLocationId = ref('')
const selectedDestinationLocationId = ref('')

const origin = ref('')
const destination = ref('')
const mileageRate = ref(0.45)
const journeyDate = ref(new Date().toISOString().slice(0, 10)) // YYYY-MM-DD
const notes = ref('')
const work = ref('')
const isReturn = ref(false)

const result = ref(null)
const showJourneys = ref(false)

onMounted(() => {
  fetchJourneys()
})

onMounted(async () => {
  await fetchLocations()
})

const homeLocation = computed(() => {
  return (locations.value || []).find(
    (l) => String(l.label || '').trim().toLowerCase() === 'home'
  )
})

const applyLocationToOrigin = (locationId) => {
  const loc = (locations.value || []).find((l) => l.id === locationId)
  if (!loc) return
  origin.value = loc.address
}

const applyLocationToDestination = (locationId) => {
  const loc = (locations.value || []).find((l) => l.id === locationId)
  if (!loc) return
  destination.value = loc.address
}

const setOriginHome = () => {
  if (!homeLocation.value) return
  origin.value = homeLocation.value.address
}

const setDestinationHome = () => {
  if (!homeLocation.value) return
  destination.value = homeLocation.value.address
}

watch(selectedOriginLocationId, (id) => {
  if (!id) return
  applyLocationToOrigin(id)
})

watch(selectedDestinationLocationId, (id) => {
  if (!id) return
  applyLocationToDestination(id)
})

// Recompute totals when return checkbox changes (after a calculation)
watch(isReturn, () => {
  if (!result.value) return
  recomputeTotals()
})

const recomputeTotals = () => {
  const oneWayCost = (result.value.distanceMiles * mileageRate.value)
  const totalMultiplier = isReturn.value ? 2 : 1
  const totalDistanceMiles = +(result.value.distanceMiles * totalMultiplier).toFixed(2)
  const totalCost = +(oneWayCost * totalMultiplier).toFixed(2)

  result.value = {
    ...result.value,
    oneWayCost: oneWayCost.toFixed(2),
    totalDistanceMiles,
    totalCost: totalCost.toFixed(2),
  }
}

const handleCalculate = async () => {
  try {
    const routeData = await calculateRoute(origin.value, destination.value)

    result.value = {
      ...routeData,
      origin: origin.value,
      destination: destination.value,
      journeyDate: journeyDate.value,
      work: work.value,
    }

    recomputeTotals()
  } catch (err) {
    console.error('Error calculating route:', err)
  }
}

const handleSave = async () => {
  if (!result.value) return

  try {
    await saveJourney({
      origin: result.value.origin,
      destination: result.value.destination,
      journeyDate: journeyDate.value,
      work: work.value,

      // one-way
      distanceMiles: result.value.distanceMiles,
      duration: result.value.duration ?? null,
      mileageRate: mileageRate.value,
      cost: result.value.oneWayCost,

      // return/total
      isReturn: isReturn.value,
      totalDistanceMiles: isReturn.value ? result.value.totalDistanceMiles : result.value.distanceMiles,
      totalCost: isReturn.value ? result.value.totalCost : result.value.oneWayCost,

      notes: notes.value || ''
    })

    alert('Journey saved!')

    // Reset
    notes.value = ''
    result.value = null
    origin.value = ''
    destination.value = ''
    isReturn.value = false
    work.value = ''

    // optional: expand journeys so you see it saved
    showJourneys.value = true
  } catch (err) {
    alert('Error saving journey: ' + err.message)
  }
}

const handleDelete = async (journeyId) => {
  if (!confirm('Delete this journey?')) return
  try {
    await deleteJourney(journeyId)
  } catch (err) {
    alert('Error deleting journey: ' + err.message)
  }
}

const formatDuration = (duration) => {
  // duration from Routes API is typically like "1234s"
  if (!duration) return ''
  const seconds = parseInt(String(duration).replace('s', ''), 10)
  if (!Number.isFinite(seconds)) return String(duration)

  const minutes = Math.round(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return hours > 0 ? `${hours}h ${mins}m` : `${minutes}m`
}
</script>
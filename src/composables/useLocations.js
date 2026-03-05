import { ref } from 'vue'
import { db } from '@/firebase/config'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore'
import { user } from '@/composables/useAuth'

export function useLocations() {
  const locations = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isHomeLabel = (label) => String(label || '').trim().toLowerCase() === 'home'

  const findHome = () => locations.value.find((l) => isHomeLabel(l.label))

  const fetchLocations = async () => {
    if (!user.value) {
      locations.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'locations'),
        where('userId', '==', user.value.uid),
      )
      const snap = await getDocs(q)

      locations.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // Keep "Home" at the top if present, then sort by label
          const aHome = (a.label || '').toLowerCase() === 'home'
          const bHome = (b.label || '').toLowerCase() === 'home'
          if (aHome && !bHome) return -1
          if (!aHome && bHome) return 1
          return String(a.label || '').localeCompare(String(b.label || ''))
        })
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const addLocation = async ({ label, address }) => {
    if (!user.value) throw new Error('Must be logged in')

    const cleanLabel = String(label || '').trim()
    const cleanAddress = String(address || '').trim()
    if (!cleanLabel) throw new Error('Label is required')
    if (!cleanAddress) throw new Error('Address is required')

    if (isHomeLabel(cleanLabel)) {
        const existingHome = findHome()
        if (existingHome) {
            throw new Error('You already have a Home location. Edit the existing one instead.')
        }
    }

    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      const payload = {
        userId: user.value.uid,
        label: cleanLabel,
        address: cleanAddress,
        createdAt: now,
        updatedAt: now,
      }
      const refDoc = await addDoc(collection(db, 'locations'), payload)
      locations.value.unshift({ id: refDoc.id, ...payload })
      return refDoc.id
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateLocation = async (id, updates) => {
    if (!user.value) throw new Error('Must be logged in')

    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    if (updates.label && isHomeLabel(updates.label)) {
        const existingHome = findHome()
        if (existingHome && existingHome.id !== id) {
            throw new Error('You already have a Home location. Edit the existing one instead.')
        }
    }

    loading.value = true
    error.value = null
    try {
      await updateDoc(doc(db, 'locations', id), payload)
      const idx = locations.value.findIndex((l) => l.id === id)
      if (idx !== -1) locations.value[idx] = { ...locations.value[idx], ...payload }
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteLocation = async (id) => {
    if (!user.value) throw new Error('Must be logged in')

    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'locations', id))
      locations.value = locations.value.filter((l) => l.id !== id)
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    locations,
    loading,
    error,
    fetchLocations,
    addLocation,
    updateLocation,
    deleteLocation,
  }
}
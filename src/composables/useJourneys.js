import { ref } from 'vue'
import { db } from '@/firebase/config'
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore'
import { user } from './useAuth'

export function useJourneys() {
  const journeys = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Calculate route using Google Routes API
  const calculateRoute = async (origin, destination) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
        },
        body: JSON.stringify({
          origin: {
            address: origin
          },
          destination: {
            address: destination
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to calculate route')
      }

      const data = await response.json()
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found')
      }

      const route = data.routes[0]
      const distanceMeters = route.distanceMeters
      const distanceMiles = (distanceMeters * 0.000621371).toFixed(2)

      return {
        distanceMeters,
        distanceMiles: parseFloat(distanceMiles),
        duration: route.duration
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch all journeys for current user
  const fetchJourneys = async () => {
    if (!user.value) {
      journeys.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'journeys'),
        where('userId', '==', user.value.uid)
      )
      const querySnapshot = await getDocs(q)
      
      journeys.value = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Save journey to Firestore
  const saveJourney = async (journeyData) => {
    if (!user.value) {
      throw new Error('Must be logged in to save journeys')
    }

    loading.value = true
    error.value = null
    try {
      const data = {
        ...journeyData,
        userId: user.value.uid,
        createdAt: new Date().toISOString()
      }
      
      const docRef = await addDoc(collection(db, 'journeys'), data)
      journeys.value.unshift({ id: docRef.id, ...data })
      
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete journey
  const deleteJourney = async (journeyId) => {
    if (!user.value) {
      throw new Error('Must be logged in to delete journeys')
    }

    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'journeys', journeyId))
      journeys.value = journeys.value.filter(j => j.id !== journeyId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    journeys,
    loading,
    error,
    calculateRoute,
    fetchJourneys,
    saveJourney,
    deleteJourney
  }
}
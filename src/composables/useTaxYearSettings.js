import { ref, computed } from 'vue'
import { db } from '@/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { user } from './useAuth'

export function useTaxYearSettings() {
  const settings = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Fetch user's tax year settings
  const fetchSettings = async () => {
    if (!user.value) {
      settings.value = null
      return
    }

    loading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'taxYearSettings', user.value.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        settings.value = docSnap.data()
      } else {
        // Default to UK tax year
        settings.value = {
          type: 'uk', // 'uk' or 'custom'
          customMonth: 1, // 1-12 (January = 1)
          customDay: 1, // 1-31
        }
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Save tax year settings
  const saveSettings = async (newSettings) => {
    if (!user.value) {
      throw new Error('Must be logged in')
    }

    loading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'taxYearSettings', user.value.uid)
      await setDoc(docRef, {
        ...newSettings,
        updatedAt: new Date().toISOString(),
      })
      settings.value = newSettings
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get the tax year for a given date
  const getTaxYear = (date, taxYearSettings) => {
    if (!date || !taxYearSettings) return 'unknown'
    
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'unknown'

    let startMonth, startDay
    
    if (taxYearSettings.type === 'uk') {
      startMonth = 4 // April
      startDay = 6
    } else {
      startMonth = taxYearSettings.customMonth || 1
      startDay = taxYearSettings.customDay || 1
    }

    // Determine the tax year start date for this calendar year
    const taxYearStartThisYear = new Date(d.getFullYear(), startMonth - 1, startDay)
    
    // If the date is before the tax year start, it belongs to the previous tax year
    let taxYearStart
    if (d < taxYearStartThisYear) {
      taxYearStart = d.getFullYear() - 1
    } else {
      taxYearStart = d.getFullYear()
    }

    // Format as "2025/26" (or just "2025" for Jan 1 start)
    const taxYearEnd = taxYearStart + 1
    return `${taxYearStart}/${String(taxYearEnd).slice(-2)}`
  }

  // Get the current tax year key
  const currentTaxYearKey = computed(() => {
    if (!settings.value) return null
    return getTaxYear(new Date(), settings.value)
  })

  return {
    settings,
    loading,
    error,
    fetchSettings,
    saveSettings,
    getTaxYear,
    currentTaxYearKey,
  }
}
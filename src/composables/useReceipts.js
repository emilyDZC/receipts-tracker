import { ref } from 'vue'
import { db, storage } from '@/firebase/config'
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { user } from './useAuth'

export function useReceipts() {
  const receipts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch receipts for current user only
  // Fetch receipts for current user only
  const fetchReceipts = async () => {
    if (!user.value) {
      receipts.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'receipts'), where('userId', '==', user.value.uid))
      const querySnapshot = await getDocs(q)

      // Sort in JavaScript instead of Firestore
      receipts.value = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Upload receipt image and save data
  const addReceipt = async (imageFile, data) => {
    if (!user.value) {
      throw new Error('Must be logged in to add receipts')
    }

    loading.value = true
    error.value = null
    try {
      // Upload image to Storage (in user-specific folder)
      const imageRef = storageRef(
        storage,
        `receipts/${user.value.uid}/${Date.now()}_${imageFile.name}`,
      )
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      // Save receipt data to Firestore with userId
      const receiptData = {
        ...data,
        imageUrl,
        userId: user.value.uid,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'receipts'), receiptData)

      // Add to local array
      receipts.value.unshift({ id: docRef.id, ...receiptData })

      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    receipts,
    loading,
    error,
    fetchReceipts,
    addReceipt,
  }
}
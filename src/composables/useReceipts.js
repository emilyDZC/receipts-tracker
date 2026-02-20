import { ref } from 'vue'
import { db, storage } from '@/firebase/config'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export function useReceipts() {
  const receipts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch all receipts
  const fetchReceipts = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      receipts.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Upload receipt image and save data
  const addReceipt = async (imageFile, data) => {
    loading.value = true
    error.value = null
    try {
      // Upload image to Storage
      const imageRef = storageRef(storage, `receipts/${Date.now()}_${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      // Save receipt data to Firestore
      const receiptData = {
        ...data,
        imageUrl,
        createdAt: new Date().toISOString()
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
    addReceipt
  }
}
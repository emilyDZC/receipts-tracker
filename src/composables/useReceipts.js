import { ref } from 'vue'
import { db, storage } from '@/firebase/config'
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  query, 
  where 
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { user } from './useAuth'

export function useReceipts() {
  const receipts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch receipts for current user only
  const fetchReceipts = async () => {
    if (!user.value) {
      receipts.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'receipts'),
        where('userId', '==', user.value.uid)
      )
      const querySnapshot = await getDocs(q)
      
      // Sort in JavaScript instead of Firestore
      receipts.value = querySnapshot.docs
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

  // Fetch a single receipt by ID
  const fetchReceipt = async (receiptId) => {
    if (!user.value) {
      throw new Error('Must be logged in')
    }

    loading.value = true
    error.value = null
    try {
      const docRef = doc(db, 'receipts', receiptId)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        throw new Error('Receipt not found')
      }

      const receiptData = { id: docSnap.id, ...docSnap.data() }
      
      // Verify it belongs to the current user
      if (receiptData.userId !== user.value.uid) {
        throw new Error('Access denied')
      }

      return receiptData
    } catch (err) {
      error.value = err.message
      throw err
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
      const imageRef = storageRef(storage, `receipts/${user.value.uid}/${Date.now()}_${imageFile.name}`)
      await uploadBytes(imageRef, imageFile)
      const imageUrl = await getDownloadURL(imageRef)

      // Save receipt data to Firestore with userId
      const receiptData = {
        ...data,
        imageUrl,
        userId: user.value.uid,
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

  // Delete receipt and its image
  const deleteReceipt = async (receiptId, imageUrl) => {
    if (!user.value) {
      throw new Error('Must be logged in to delete receipts')
    }

    loading.value = true
    error.value = null
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'receipts', receiptId))

      // Delete image from Storage
      if (imageUrl) {
        try {
          const imageRef = storageRef(storage, imageUrl)
          await deleteObject(imageRef)
        } catch (err) {
          console.warn('Could not delete image:', err)
          // Continue even if image deletion fails
        }
      }

      // Remove from local array
      receipts.value = receipts.value.filter(r => r.id !== receiptId)
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update receipt data (without changing image)
  const updateReceipt = async (receiptId, data) => {
    if (!user.value) {
      throw new Error('Must be logged in to update receipts')
    }

    loading.value = true
    error.value = null
    try {
      const receiptRef = doc(db, 'receipts', receiptId)
      await updateDoc(receiptRef, data)

      // Update local array
      const index = receipts.value.findIndex(r => r.id === receiptId)
      if (index !== -1) {
        receipts.value[index] = { ...receipts.value[index], ...data }
      }
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Replace receipt image
  const replaceReceiptImage = async (receiptId, oldImageUrl, newImageFile) => {
    if (!user.value) {
      throw new Error('Must be logged in to update receipts')
    }

    loading.value = true
    error.value = null
    try {
      // Upload new image
      const imageRef = storageRef(storage, `receipts/${user.value.uid}/${Date.now()}_${newImageFile.name}`)
      await uploadBytes(imageRef, newImageFile)
      const newImageUrl = await getDownloadURL(imageRef)

      // Update Firestore with new image URL
      const receiptRef = doc(db, 'receipts', receiptId)
      await updateDoc(receiptRef, { imageUrl: newImageUrl })

      // Delete old image from Storage
      if (oldImageUrl) {
        try {
          const oldImageRef = storageRef(storage, oldImageUrl)
          await deleteObject(oldImageRef)
        } catch (err) {
          console.warn('Could not delete old image:', err)
        }
      }

      // Update local array
      const index = receipts.value.findIndex(r => r.id === receiptId)
      if (index !== -1) {
        receipts.value[index].imageUrl = newImageUrl
      }

      return newImageUrl
      
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
    fetchReceipt,
    addReceipt,
    deleteReceipt,
    updateReceipt,
    replaceReceiptImage
  }
}
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
apiKey: "AIzaSyD0SCwEoYOFa6F4i0fQDjCSqPDnX1e8QtM",
  authDomain: "receipt-tracker-f6d3f.firebaseapp.com",
  projectId: "receipt-tracker-f6d3f",
  storageBucket: "receipt-tracker-f6d3f.firebasestorage.app",
  messagingSenderId: "202091204236",
  appId: "1:202091204236:web:5aefcad4ef83b3e97335a9"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

export { db, storage }
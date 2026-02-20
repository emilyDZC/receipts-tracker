import { ref } from 'vue'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'

const auth = getAuth()
const user = ref(null)
const loading = ref(true)

// Initialize auth state listener immediately (not in onMounted)
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  loading.value = false
})

export function useAuth() {
  const error = ref(null)

  // Sign up new user
  const signUp = async (email, password) => {
    error.value = null
    loading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in existing user
  const signIn = async (email, password) => {
    error.value = null
    loading.value = true
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      return userCredential.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const logOut = async () => {
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logOut,
  }
}

// Export for use outside components
export { user, loading }

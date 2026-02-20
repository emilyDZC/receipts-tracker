<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold mb-6 text-center">Receipt Tracker</h1>
      
      <div class="mb-6 flex gap-2">
        <button 
          @click="isSignUp = false"
          :class="[
            'flex-1 py-2 px-4 rounded-md transition',
            !isSignUp ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          Sign In
        </button>
        <button 
          @click="isSignUp = true"
          :class="[
            'flex-1 py-2 px-4 rounded-md transition',
            isSignUp ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          ]"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          >
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {{ error }}
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {{ loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { signUp, signIn, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)

const handleSubmit = async () => {
  try {
    if (isSignUp.value) {
      await signUp(email.value, password.value)
    } else {
      await signIn(email.value, password.value)
    }
    router.push('/')
  } catch (err) {
    // Error already set in useAuth
    console.error(err)
  }
}
</script>
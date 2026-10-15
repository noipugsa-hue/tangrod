import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type Auth,
  type UserCredential
} from 'firebase/auth'
import type { User } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: false,
    isGuest: true,
    initialized: false
  }),

  getters: {
    isAuthenticated(): boolean {
      return this.user !== null
    },

    isAdmin(): boolean {
      return this.user?.role === 'ADMIN'
    }
  },

  actions: {
    async initAuth() {
      if (this.initialized) return

      const { $firebase } = useNuxtApp()
      const auth = $firebase.auth as Auth

      this.loading = true

      return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in
            this.user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: 'USER',
              savedLocations: [],
              createdAt: new Date()
            }
            this.isGuest = false
          } else {
            // User is signed out
            this.user = null
            this.isGuest = true
          }

          this.loading = false
          this.initialized = true
          resolve()
        })
      })
    },

    async loginWithEmail(email: string, password: string): Promise<UserCredential> {
      const { $firebase } = useNuxtApp()
      const auth = $firebase.auth as Auth

      this.loading = true
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential
      } catch (error) {
        console.error('Login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async registerWithEmail(email: string, password: string): Promise<UserCredential> {
      const { $firebase } = useNuxtApp()
      const auth = $firebase.auth as Auth

      this.loading = true
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        return userCredential
      } catch (error) {
        console.error('Register error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle(): Promise<UserCredential> {
      const { $firebase } = useNuxtApp()
      const auth = $firebase.auth as Auth

      this.loading = true
      try {
        const provider = new GoogleAuthProvider()
        const userCredential = await signInWithPopup(auth, provider)
        return userCredential
      } catch (error) {
        console.error('Google login error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout(): Promise<void> {
      const { $firebase } = useNuxtApp()
      const auth = $firebase.auth as Auth

      this.loading = true
      try {
        await signOut(auth)
        this.user = null
        this.isGuest = true
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    setUser(user: User | null) {
      this.user = user
      this.isGuest = user === null
    },

    setLoading(loading: boolean) {
      this.loading = loading
    }
  }
})

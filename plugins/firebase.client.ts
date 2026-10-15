import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
    measurementId: config.public.firebaseMeasurementId
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)

    // Initialize services
    const auth = getAuth(app)
    const firestore = getFirestore(app)
    const storage = getStorage(app)

    // Initialize Analytics (only in browser)
    let analytics = null
    if (process.client) {
      try {
        analytics = getAnalytics(app)
      } catch (analyticsError) {
        console.warn('Firebase Analytics initialization failed:', analyticsError)
        // Continue without analytics
      }
    }

    return {
      provide: {
        firebase: {
          app,
          auth,
          firestore,
          storage,
          analytics
        }
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
    // Return null services to prevent app crash
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          firestore: null,
          storage: null,
          analytics: null
        }
      }
    }
  }
})

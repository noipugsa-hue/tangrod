import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'

export class NotificationService {
  private messaging: Messaging | null = null
  private vapidKey = 'BtZgZV9QKaJ7zkDKHvPV' // Replace with your actual VAPID key from Firebase Console

  constructor() {
    // Initialize messaging only on client-side
    if (process.client) {
      try {
        const { $firebase } = useNuxtApp()
        this.messaging = getMessaging($firebase.app)
      } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error)
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  async getNotificationToken(): Promise<string | null> {
    if (!this.messaging) {
      console.warn('Firebase Messaging not initialized')
      return null
    }

    try {
      const permission = await this.requestPermission()
      if (!permission) {
        console.warn('Notification permission denied')
        return null
      }

      // Get FCM token
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      })

      console.log('FCM Token:', token)
      return token
    } catch (error) {
      console.error('Error getting notification token:', error)
      return null
    }
  }

  setupForegroundListener() {
    if (!this.messaging) {
      console.warn('Firebase Messaging not initialized')
      return
    }

    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload)

      // Show notification
      const notificationTitle = payload.notification?.title || 'ทางรอด'
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: payload.data
      }

      if (Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions)
      }
    })
  }

  async showLocalNotification(title: string, body: string, data?: any) {
    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) return
    }

    new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data
    })
  }

  async subscribeToFloodAlerts(): Promise<boolean> {
    try {
      const token = await this.getNotificationToken()
      if (!token) return false

      // In a real app, you would send this token to your backend
      // to associate it with the user and send targeted notifications
      console.log('Subscribed to flood alerts with token:', token)

      // Store token in localStorage for future use
      if (process.client) {
        localStorage.setItem('fcm_token', token)
      }

      return true
    } catch (error) {
      console.error('Error subscribing to flood alerts:', error)
      return false
    }
  }

  getStoredToken(): string | null {
    if (!process.client) return null
    return localStorage.getItem('fcm_token')
  }

  isNotificationSupported(): boolean {
    return 'Notification' in window
  }

  getNotificationPermission(): NotificationPermission | null {
    if (!this.isNotificationSupported()) return null
    return Notification.permission
  }
}

// Composable
export const useNotificationService = () => {
  return new NotificationService()
}

// Firebase Cloud Messaging Service Worker
// This file handles background notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase in the service worker
// Note: Replace these with your actual Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDA1z5xupZ9-ZEHiEe633_k66-_ItnYVVo",
  authDomain: "inbound-analogy-409510.firebaseapp.com",
  projectId: "inbound-analogy-409510",
  storageBucket: "inbound-analogy-409510.firebasestorage.app",
  messagingSenderId: "712724017139",
  appId: "1:712724017139:web:2dd155fbbc6d59b25dac86"
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'ทางรอด'
  const notificationOptions = {
    body: payload.notification?.body || 'คุณมีการแจ้งเตือนใหม่',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
    tag: 'tangrod-notification',
    requireInteraction: true
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event)

  event.notification.close()

  // Open the app or navigate to a specific page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus on it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

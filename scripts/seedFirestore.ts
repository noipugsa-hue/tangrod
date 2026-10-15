import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { seedFloodAreas, seedEmergencyPlaces } from '../utils/seedData'

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDA1z5xupZ9-ZEHiEe633_k66-_ItnYVVo",
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "inbound-analogy-409510.firebaseapp.com",
  projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || "inbound-analogy-409510",
  storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "inbound-analogy-409510.firebasestorage.app",
  messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "712724017139",
  appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || "1:712724017139:web:2dd155fbbc6d59b25dac86"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function seedData() {
  console.log('🌱 Starting Firestore seed...\n')

  try {
    // Seed Flood Areas
    console.log('📍 Seeding flood areas...')
    for (const area of seedFloodAreas) {
      const { id, reportedAt, updatedAt, ...data } = area
      await addDoc(collection(db, 'floodAreas'), {
        ...data,
        reportedAt: Timestamp.fromDate(reportedAt),
        updatedAt: Timestamp.fromDate(updatedAt)
      })
      console.log(`  ✅ Added flood area: ${area.severity} at (${area.location.lat}, ${area.location.lng})`)
    }
    console.log(`✅ Seeded ${seedFloodAreas.length} flood areas\n`)

    // Seed Emergency Places
    console.log('🏥 Seeding emergency places...')
    for (const place of seedEmergencyPlaces) {
      const { id, ...data } = place
      await addDoc(collection(db, 'emergencyPlaces'), data)
      console.log(`  ✅ Added ${place.type}: ${place.name}`)
    }
    console.log(`✅ Seeded ${seedEmergencyPlaces.length} emergency places\n`)

    console.log('🎉 Firestore seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error)
    process.exit(1)
  }
}

// Run seed
seedData()
  .then(() => {
    console.log('\n✨ All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

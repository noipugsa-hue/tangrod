import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type Firestore
} from 'firebase/firestore'
import type { FloodReport, FloodArea, EmergencyPlace } from '~/types'

export class FirebaseService {
  private db: Firestore

  constructor(firestore: Firestore) {
    this.db = firestore
  }

  // Flood Reports
  async createFloodReport(report: Omit<FloodReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, 'floodReports'), {
        ...report,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating flood report:', error)
      throw error
    }
  }

  async getFloodReports(limitCount = 50): Promise<FloodReport[]> {
    try {
      const q = query(
        collection(this.db, 'floodReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FloodReport[]
    } catch (error) {
      console.error('Error getting flood reports:', error)
      return []
    }
  }

  async getFloodReportById(id: string): Promise<FloodReport | null> {
    try {
      const docRef = doc(this.db, 'floodReports', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as FloodReport
      }
      return null
    } catch (error) {
      console.error('Error getting flood report:', error)
      return null
    }
  }

  async updateFloodReport(id: string, updates: Partial<FloodReport>): Promise<void> {
    try {
      const docRef = doc(this.db, 'floodReports', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating flood report:', error)
      throw error
    }
  }

  async deleteFloodReport(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'floodReports', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting flood report:', error)
      throw error
    }
  }

  async likeFloodReport(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'floodReports', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const currentLikes = docSnap.data().likes || 0
        await updateDoc(docRef, {
          likes: currentLikes + 1
        })
      }
    } catch (error) {
      console.error('Error liking flood report:', error)
      throw error
    }
  }

  // Flood Areas
  async getFloodAreas(): Promise<FloodArea[]> {
    try {
      const snapshot = await getDocs(collection(this.db, 'floodAreas'))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as FloodArea[]
    } catch (error) {
      console.error('Error getting flood areas:', error)
      return []
    }
  }

  async createFloodArea(area: Omit<FloodArea, 'id' | 'reportedAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, 'floodAreas'), {
        ...area,
        reportedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating flood area:', error)
      throw error
    }
  }

  async deleteFloodArea(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'floodAreas', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting flood area:', error)
      throw error
    }
  }

  // Emergency Places
  async getEmergencyPlaces(): Promise<EmergencyPlace[]> {
    try {
      const snapshot = await getDocs(collection(this.db, 'emergencyPlaces'))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyPlace[]
    } catch (error) {
      console.error('Error getting emergency places:', error)
      return []
    }
  }

  async getEmergencyPlacesByType(type: string): Promise<EmergencyPlace[]> {
    try {
      const q = query(
        collection(this.db, 'emergencyPlaces'),
        where('type', '==', type)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyPlace[]
    } catch (error) {
      console.error('Error getting emergency places by type:', error)
      return []
    }
  }

  async deleteEmergencyPlace(id: string): Promise<void> {
    try {
      const docRef = doc(this.db, 'emergencyPlaces', id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting emergency place:', error)
      throw error
    }
  }
}

// Composable for easy access
export const useFirebaseService = () => {
  const { $firebase } = useNuxtApp()
  return new FirebaseService($firebase.firestore as Firestore)
}

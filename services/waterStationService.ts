import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  type Firestore
} from 'firebase/firestore'
import type { WaterStation } from '~/types'

export class WaterStationService {
  private db: Firestore

  constructor(firestore: Firestore) {
    this.db = firestore
  }

  /**
   * Get all active water stations
   */
  async getAllStations(limit = 100): Promise<WaterStation[]> {
    try {
      const q = query(
        collection(this.db, 'waterStations'),
        where('active', '==', true),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as WaterStation[]
    } catch (error) {
      console.error('Error getting water stations:', error)
      return []
    }
  }

  /**
   * Get water stations by province
   */
  async getStationsByProvince(province: string, limit = 50): Promise<WaterStation[]> {
    try {
      const q = query(
        collection(this.db, 'waterStations'),
        where('province', '==', province),
        where('active', '==', true),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as WaterStation[]
    } catch (error) {
      console.error('Error getting water stations by province:', error)
      return []
    }
  }

  /**
   * Get water stations by water level status
   */
  async getStationsByLevel(waterLevel: 'CRITICAL' | 'HIGH_RISK' | 'WATCH' | 'NORMAL', limit = 50): Promise<WaterStation[]> {
    try {
      const q = query(
        collection(this.db, 'waterStations'),
        where('waterLevel', '==', waterLevel),
        where('active', '==', true),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as WaterStation[]
    } catch (error) {
      console.error('Error getting water stations by level:', error)
      return []
    }
  }

  /**
   * Get a single water station by ID
   */
  async getStationById(id: string): Promise<WaterStation | null> {
    try {
      const docRef = doc(this.db, 'waterStations', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as WaterStation
      }
      return null
    } catch (error) {
      console.error('Error getting water station:', error)
      return null
    }
  }

  /**
   * Get stations grouped by water level
   */
  async getStationsGroupedByLevel(): Promise<Record<string, WaterStation[]>> {
    try {
      const stations = await this.getAllStations()
      const grouped: Record<string, WaterStation[]> = {
        CRITICAL: [],
        HIGH_RISK: [],
        WATCH: [],
        NORMAL: []
      }

      stations.forEach(station => {
        grouped[station.waterLevel].push(station)
      })

      return grouped
    } catch (error) {
      console.error('Error grouping stations by level:', error)
      return {
        CRITICAL: [],
        HIGH_RISK: [],
        WATCH: [],
        NORMAL: []
      }
    }
  }

  /**
   * Get critical water level count
   */
  async getCriticalCount(): Promise<number> {
    try {
      const stations = await this.getStationsByLevel('CRITICAL')
      return stations.length
    } catch (error) {
      console.error('Error getting critical count:', error)
      return 0
    }
  }
}

// Composable to use the service
let waterStationService: WaterStationService | null = null

export function useWaterStationService(): WaterStationService {
  if (!process.client) {
    throw new Error('WaterStationService can only be used on client side')
  }

  if (!waterStationService) {
    const { $firestore } = useNuxtApp()
    if (!$firestore) {
      throw new Error('Firestore is not initialized')
    }
    waterStationService = new WaterStationService($firestore)
  }

  return waterStationService
}

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  type Firestore,
  Timestamp
} from 'firebase/firestore'
import type { RainfallData, RainfallHistory } from '~/types'

export class RainfallService {
  private db: Firestore

  constructor(firestore: Firestore) {
    this.db = firestore
  }

  /**
   * Get rainfall data for the last 24 hours
   */
  async getLast24Hours(stationName?: string): Promise<RainfallData[]> {
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      let q = query(
        collection(this.db, 'rainfallData'),
        where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
        orderBy('timestamp', 'desc')
      )

      if (stationName) {
        q = query(
          collection(this.db, 'rainfallData'),
          where('stationName', '==', stationName),
          where('timestamp', '>=', Timestamp.fromDate(twentyFourHoursAgo)),
          orderBy('timestamp', 'desc')
        )
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as RainfallData[]
    } catch (error) {
      console.error('Error getting rainfall data:', error)
      return []
    }
  }

  /**
   * Get rainfall history with hourly data for the last 24 hours
   */
  async getRainfallHistory(stationName?: string): Promise<RainfallHistory> {
    try {
      const hourlyData = await this.getLast24Hours(stationName)

      // Group by hour
      const groupedByHour: RainfallData[] = []
      const hourMap = new Map<number, RainfallData[]>()

      hourlyData.forEach(data => {
        const hour = new Date(data.timestamp).setMinutes(0, 0, 0)
        if (!hourMap.has(hour)) {
          hourMap.set(hour, [])
        }
        hourMap.get(hour)!.push(data)
      })

      // Calculate average for each hour
      hourMap.forEach((dataPoints, hour) => {
        const avgAmount = dataPoints.reduce((sum, d) => sum + d.amount, 0) / dataPoints.length
        groupedByHour.push({
          id: `hour-${hour}`,
          timestamp: new Date(hour),
          amount: avgAmount,
          location: dataPoints[0].location,
          stationName: dataPoints[0].stationName
        })
      })

      // Sort by timestamp
      groupedByHour.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      return {
        hourly: groupedByHour,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error getting rainfall history:', error)
      return {
        hourly: [],
        lastUpdated: new Date()
      }
    }
  }

  /**
   * Get latest rainfall data
   */
  async getLatest(limit = 10): Promise<RainfallData[]> {
    try {
      const q = query(
        collection(this.db, 'rainfallData'),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as RainfallData[]
    } catch (error) {
      console.error('Error getting latest rainfall data:', error)
      return []
    }
  }

  /**
   * Get total rainfall for the last 24 hours
   */
  async getTotalLast24Hours(stationName?: string): Promise<number> {
    try {
      const data = await this.getLast24Hours(stationName)
      return data.reduce((sum, d) => sum + d.amount, 0)
    } catch (error) {
      console.error('Error getting total rainfall:', error)
      return 0
    }
  }
}

// Composable to use the service
let rainfallService: RainfallService | null = null

export function useRainfallService(): RainfallService {
  if (!process.client) {
    throw new Error('RainfallService can only be used on client side')
  }

  if (!rainfallService) {
    const { $firestore } = useNuxtApp()
    if (!$firestore) {
      throw new Error('Firestore is not initialized')
    }
    rainfallService = new RainfallService($firestore)
  }

  return rainfallService
}

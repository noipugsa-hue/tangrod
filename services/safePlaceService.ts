import { FirebaseService } from './firebaseService'
import type { EmergencyPlace, Location, EmergencyPlaceType } from '~/types'

export interface SafePlaceFilter {
  type?: EmergencyPlaceType
  location?: Location
  maxDistance?: number // km
}

export class SafePlaceService extends FirebaseService {
  /**
   * Get emergency places near location
   */
  async getPlacesNearLocation(
    location: Location,
    maxDistance: number = 10,
    type?: EmergencyPlaceType
  ): Promise<EmergencyPlace[]> {
    let places = await this.getEmergencyPlaces()

    // Filter by type
    if (type) {
      places = places.filter(p => p.type === type)
    }

    // Calculate distances and filter
    const { useRiskStore } = await import('~/stores/risk')
    const riskStore = useRiskStore()

    const placesWithDistance = places.map(place => ({
      ...place,
      distance: riskStore.calculateDistance(location, place.location)
    }))

    // Filter by distance and sort
    return placesWithDistance
      .filter(p => p.distance! <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
  }

  /**
   * Get nearest place of specific type
   */
  async getNearestPlace(
    location: Location,
    type: EmergencyPlaceType
  ): Promise<EmergencyPlace | null> {
    const places = await this.getPlacesNearLocation(location, 50, type)
    return places.length > 0 ? places[0] : null
  }

  /**
   * Get all hospitals near location
   */
  async getNearbyHospitals(location: Location, maxDistance: number = 20): Promise<EmergencyPlace[]> {
    return this.getPlacesNearLocation(location, maxDistance, 'HOSPITAL')
  }

  /**
   * Get all shelters near location
   */
  async getNearbyShelters(location: Location, maxDistance: number = 15): Promise<EmergencyPlace[]> {
    return this.getPlacesNearLocation(location, maxDistance, 'SHELTER')
  }

  /**
   * Get emergency contacts (police, fire station)
   */
  async getEmergencyContacts(location: Location): Promise<EmergencyPlace[]> {
    const police = await this.getPlacesNearLocation(location, 20, 'POLICE')
    const fireStations = await this.getPlacesNearLocation(location, 20, 'FIRE_STATION')
    return [...police, ...fireStations]
  }

  /**
   * Search places by name
   */
  async searchPlaces(query: string): Promise<EmergencyPlace[]> {
    const allPlaces = await this.getEmergencyPlaces()
    const lowerQuery = query.toLowerCase()

    return allPlaces.filter(place =>
      place.name.toLowerCase().includes(lowerQuery) ||
      place.address.district.toLowerCase().includes(lowerQuery) ||
      place.address.province.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get place type label in Thai
   */
  getPlaceTypeLabel(type: EmergencyPlaceType): string {
    const labels: Record<EmergencyPlaceType, string> = {
      HOSPITAL: 'โรงพยาบาล',
      POLICE: 'สถานีตำรวจ',
      FIRE_STATION: 'สถานีดับเพลิง',
      SHELTER: 'ศูนย์พักพิง',
      GAS_STATION: 'ปั๊มน้ำมัน'
    }
    return labels[type] || type
  }

  /**
   * Get place type icon
   */
  getPlaceTypeIcon(type: EmergencyPlaceType): string {
    const icons: Record<EmergencyPlaceType, string> = {
      HOSPITAL: '🏥',
      POLICE: '👮',
      FIRE_STATION: '🚒',
      SHELTER: '🏠',
      GAS_STATION: '⛽'
    }
    return icons[type] || '📍'
  }
}

// Composable
export const useSafePlaceService = () => {
  const { $firebase } = useNuxtApp()
  return new SafePlaceService($firebase.firestore)
}

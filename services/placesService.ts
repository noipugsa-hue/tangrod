import type { Location, EmergencyPlace } from '~/types'
import { useGoogleMapsService } from '~/services/googleMapsService'

export interface PlaceSearchRequest {
  location: Location
  radius: number // in meters
  type: 'hospital' | 'police' | 'fire_station' | 'shelter' | 'gas_station'
}

export interface PlaceResult {
  id: string
  name: string
  location: Location
  address: string
  distance: number // in meters
  phone?: string
  rating?: number
  openNow?: boolean
}

class PlacesService {
  private placesService: google.maps.places.PlacesService | null = null

  /**
   * Initialize places service
   */
  private async initPlacesService(map: google.maps.Map): Promise<void> {
    if (this.placesService) return

    const mapsService = useGoogleMapsService()
    await mapsService.loadGoogleMaps(['places'])

    this.placesService = new google.maps.places.PlacesService(map)
  }

  /**
   * Search nearby places (using legacy API - still supported)
   */
  async searchNearbyPlaces(
    map: google.maps.Map,
    request: PlaceSearchRequest
  ): Promise<PlaceResult[]> {
    await this.initPlacesService(map)

    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      const searchRequest: google.maps.places.PlaceSearchRequest = {
        location: { lat: request.location.lat, lng: request.location.lng },
        radius: request.radius,
        type: this.mapPlaceType(request.type)
      }

      this.placesService!.nearbySearch(searchRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map(place => {
            const placeLocation: Location = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }

            return {
              id: place.place_id || '',
              name: place.name || '',
              location: placeLocation,
              address: place.vicinity || '',
              distance: this.calculateDistance(request.location, placeLocation),
              rating: place.rating,
              openNow: place.opening_hours?.open_now
            }
          })

          // Sort by distance
          places.sort((a, b) => a.distance - b.distance)

          resolve(places)
        } else {
          reject(new Error(`Places search failed: ${status}`))
        }
      })
    })
  }

  /**
   * Get place details (using legacy API - still supported)
   */
  async getPlaceDetails(map: google.maps.Map, placeId: string): Promise<PlaceResult | null> {
    await this.initPlacesService(map)

    if (!this.placesService) {
      throw new Error('Places service not initialized')
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['name', 'geometry', 'formatted_address', 'formatted_phone_number', 'rating', 'opening_hours']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const location: Location = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            }

            resolve({
              id: placeId,
              name: place.name || '',
              location,
              address: place.formatted_address || '',
              distance: 0,
              phone: place.formatted_phone_number,
              rating: place.rating,
              openNow: place.opening_hours?.open_now
            })
          } else {
            reject(new Error(`Place details failed: ${status}`))
          }
        }
      )
    })
  }

  /**
   * Search hospitals
   */
  async searchHospitals(map: google.maps.Map, location: Location, radius: number = 5000): Promise<PlaceResult[]> {
    return this.searchNearbyPlaces(map, {
      location,
      radius,
      type: 'hospital'
    })
  }

  /**
   * Search police stations
   */
  async searchPoliceStations(map: google.maps.Map, location: Location, radius: number = 5000): Promise<PlaceResult[]> {
    return this.searchNearbyPlaces(map, {
      location,
      radius,
      type: 'police'
    })
  }

  /**
   * Search fire stations
   */
  async searchFireStations(map: google.maps.Map, location: Location, radius: number = 5000): Promise<PlaceResult[]> {
    return this.searchNearbyPlaces(map, {
      location,
      radius,
      type: 'fire_station'
    })
  }

  /**
   * Search gas stations
   */
  async searchGasStations(map: google.maps.Map, location: Location, radius: number = 5000): Promise<PlaceResult[]> {
    return this.searchNearbyPlaces(map, {
      location,
      radius,
      type: 'gas_station'
    })
  }

  /**
   * Add place markers to map
   */
  addPlaceMarkers(
    map: google.maps.Map,
    places: PlaceResult[],
    icon?: string,
    onClickCallback?: (place: PlaceResult) => void
  ): google.maps.Marker[] {
    const markers: google.maps.Marker[] = []

    places.forEach(place => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: place.location.lat, lng: place.location.lng },
        title: place.name,
        icon: icon ? {
          url: icon,
          scaledSize: new google.maps.Size(32, 32)
        } : undefined
      })

      // Info window
      const infoContent = `
        <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">${place.name}</h3>
          <p style="font-size: 14px; margin: 4px 0;">${place.address}</p>
          <p style="font-size: 14px; margin: 4px 0;">ระยะทาง: ${(place.distance / 1000).toFixed(2)} กม.</p>
          ${place.phone ? `<p style="font-size: 14px; margin: 4px 0;">โทร: ${place.phone}</p>` : ''}
          ${place.rating ? `<p style="font-size: 14px; margin: 4px 0;">⭐ ${place.rating}</p>` : ''}
          ${place.openNow !== undefined ? `<p style="font-size: 14px; margin: 4px 0;">${place.openNow ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}</p>` : ''}
        </div>
      `

      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
        if (onClickCallback) {
          onClickCallback(place)
        }
      })

      markers.push(marker)
    })

    return markers
  }

  /**
   * Map place type
   */
  private mapPlaceType(type: string): string {
    switch (type) {
      case 'hospital':
        return 'hospital'
      case 'police':
        return 'police'
      case 'fire_station':
        return 'fire_station'
      case 'gas_station':
        return 'gas_station'
      case 'shelter':
        return 'lodging' // Closest match for shelters
      default:
        return type
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1.lat * Math.PI) / 180
    const φ2 = (point2.lat * Math.PI) / 180
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}

// Export singleton
export const usePlacesService = () => {
  return new PlacesService()
}

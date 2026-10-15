import type { Location, FloodArea } from '~/types'
import { useGoogleMapsService } from '~/services/googleMapsService'
import { useRiskStore } from '~/stores/risk'

export interface RouteRequest {
  origin: Location
  destination: Location
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'
  avoidFloodAreas?: boolean
}

export interface RouteResult {
  distance: number // in meters
  duration: number // in seconds
  polyline: Location[]
  warnings: string[]
  hasFloodRisk: boolean
  floodAreasOnRoute: FloodArea[]
}

class RoutesService {
  private directionsService: google.maps.DirectionsService | null = null
  private directionsRenderer: google.maps.DirectionsRenderer | null = null

  /**
   * Initialize directions service
   */
  private async initDirectionsService(): Promise<void> {
    if (this.directionsService) return

    const mapsService = useGoogleMapsService()
    await mapsService.loadGoogleMaps(['routes'])

    this.directionsService = new google.maps.DirectionsService()
  }

  /**
   * Calculate route
   */
  async calculateRoute(request: RouteRequest): Promise<RouteResult | null> {
    await this.initDirectionsService()

    if (!this.directionsService) {
      throw new Error('Directions service not initialized')
    }

    try {
      const response = await this.directionsService.route({
        origin: { lat: request.origin.lat, lng: request.origin.lng },
        destination: { lat: request.destination.lat, lng: request.destination.lng },
        travelMode: google.maps.TravelMode[request.travelMode || 'DRIVING'],
        provideRouteAlternatives: true
      })

      if (response.routes && response.routes.length > 0) {
        const route = response.routes[0]
        const leg = route.legs[0]

        // Extract polyline points
        const polyline: Location[] = []
        route.overview_path.forEach(point => {
          polyline.push({
            lat: point.lat(),
            lng: point.lng()
          })
        })

        // Check for flood areas on route
        const riskStore = useRiskStore()
        const floodAreas = riskStore.floodAreas
        const floodAreasOnRoute = this.checkFloodAreasOnRoute(polyline, floodAreas)

        const warnings: string[] = []
        if (floodAreasOnRoute.length > 0) {
          floodAreasOnRoute.forEach(area => {
            warnings.push(`พื้นที่น้ำท่วม ${this.getSeverityLabel(area.severity)} (${area.waterLevel} ซม.)`)
          })
        }

        return {
          distance: leg.distance?.value || 0,
          duration: leg.duration?.value || 0,
          polyline,
          warnings,
          hasFloodRisk: floodAreasOnRoute.length > 0,
          floodAreasOnRoute
        }
      }

      return null
    } catch (error) {
      console.error('Route calculation error:', error)
      return null
    }
  }

  /**
   * Render route on map
   */
  renderRoute(map: google.maps.Map, polyline: Location[]): void {
    if (!this.directionsRenderer) {
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#1E40AF',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      })
    }

    // Create path from polyline
    const path = polyline.map(point => ({
      lat: point.lat,
      lng: point.lng
    }))

    // Draw polyline
    const routePath = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1E40AF',
      strokeOpacity: 0.8,
      strokeWeight: 5,
      map
    })
  }

  /**
   * Calculate alternative routes
   */
  async calculateAlternativeRoutes(request: RouteRequest): Promise<RouteResult[]> {
    await this.initDirectionsService()

    if (!this.directionsService) {
      throw new Error('Directions service not initialized')
    }

    try {
      const response = await this.directionsService.route({
        origin: { lat: request.origin.lat, lng: request.origin.lng },
        destination: { lat: request.destination.lat, lng: request.destination.lng },
        travelMode: google.maps.TravelMode[request.travelMode || 'DRIVING'],
        provideRouteAlternatives: true
      })

      const results: RouteResult[] = []

      if (response.routes) {
        for (const route of response.routes) {
          const leg = route.legs[0]

          const polyline: Location[] = []
          route.overview_path.forEach(point => {
            polyline.push({
              lat: point.lat(),
              lng: point.lng()
            })
          })

          const riskStore = useRiskStore()
          const floodAreas = riskStore.floodAreas
          const floodAreasOnRoute = this.checkFloodAreasOnRoute(polyline, floodAreas)

          const warnings: string[] = []
          if (floodAreasOnRoute.length > 0) {
            floodAreasOnRoute.forEach(area => {
              warnings.push(`พื้นที่น้ำท่วม ${this.getSeverityLabel(area.severity)}`)
            })
          }

          results.push({
            distance: leg.distance?.value || 0,
            duration: leg.duration?.value || 0,
            polyline,
            warnings,
            hasFloodRisk: floodAreasOnRoute.length > 0,
            floodAreasOnRoute
          })
        }
      }

      // Sort by risk level (safest first) and then by duration
      return results.sort((a, b) => {
        if (a.hasFloodRisk !== b.hasFloodRisk) {
          return a.hasFloodRisk ? 1 : -1
        }
        return a.duration - b.duration
      })
    } catch (error) {
      console.error('Alternative routes calculation error:', error)
      return []
    }
  }

  /**
   * Check if route passes through flood areas
   */
  private checkFloodAreasOnRoute(polyline: Location[], floodAreas: FloodArea[]): FloodArea[] {
    const affectedAreas: FloodArea[] = []

    for (const area of floodAreas) {
      // Check if any point on the route is within the flood area radius
      for (const point of polyline) {
        const distance = this.calculateDistance(point, area.location)
        if (distance <= area.radius * 1000) { // Convert km to meters
          if (!affectedAreas.find(a => a.id === area.id)) {
            affectedAreas.push(area)
          }
          break
        }
      }
    }

    return affectedAreas
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

  /**
   * Get severity label
   */
  private getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'NONE':
        return 'ไม่มีน้ำท่วม'
      case 'MINOR':
        return 'น้ำท่วมเล็กน้อย'
      case 'MODERATE':
        return 'น้ำท่วมปานกลาง'
      case 'SEVERE':
        return 'น้ำท่วมสูง'
      case 'CRITICAL':
        return 'น้ำท่วมรุนแรง'
      default:
        return 'ไม่ทราบ'
    }
  }

  /**
   * Clear rendered route
   */
  clearRoute(): void {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null)
      this.directionsRenderer = null
    }
  }
}

// Export singleton
export const useRoutesService = () => {
  return new RoutesService()
}

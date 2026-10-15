import type { Location, Route, RoutePoint, RouteSegment, FloodArea, RiskLevel, VehicleType } from '~/types'
import { useRiskStore } from '~/stores/risk'

export class RouteService {
  private riskStore = useRiskStore()

  /**
   * Calculate route between two points
   * @param origin Starting location
   * @param destination Ending location
   * @param vehicleType Type of vehicle
   * @param avoidFloodZones Whether to avoid flooded areas
   */
  async calculateRoute(
    origin: Location,
    destination: Location,
    vehicleType: VehicleType = 'CAR',
    avoidFloodZones: boolean = true
  ): Promise<Route> {
    // In production, this would call a routing API (e.g., OSRM, Mapbox, Google Maps)
    // For now, we'll create a simple straight-line route with risk assessment

    const distance = this.calculateDistance(origin, destination)
    const duration = this.estimateDuration(distance, vehicleType)

    // Create simple 3-segment route
    const segments = this.createRouteSegments(origin, destination, avoidFloodZones)

    // Calculate overall risk
    const riskAssessment = this.assessRouteRisk(segments)

    // Get flood areas along the route
    const floodAreas = this.getFloodAreasAlongRoute(segments)

    return {
      id: `route-${Date.now()}`,
      origin: {
        location: origin,
        address: 'ต้นทาง',
        type: 'origin'
      },
      destination: {
        location: destination,
        address: 'ปลายทาง',
        type: 'destination'
      },
      segments,
      totalDistance: distance,
      totalDuration: duration,
      riskAssessment,
      floodAreas,
      avoidFloodZones,
      vehicleType,
      createdAt: new Date()
    }
  }

  /**
   * Create route segments between origin and destination
   */
  private createRouteSegments(
    origin: Location,
    destination: Location,
    avoidFloodZones: boolean
  ): RouteSegment[] {
    // Calculate intermediate points
    const segments: RouteSegment[] = []
    const numSegments = 3

    for (let i = 0; i < numSegments; i++) {
      const progress = (i + 1) / numSegments
      const start = i === 0 ? origin : {
        lat: origin.lat + (destination.lat - origin.lat) * (i / numSegments),
        lng: origin.lng + (destination.lng - origin.lng) * (i / numSegments)
      }
      const end = {
        lat: origin.lat + (destination.lat - origin.lat) * progress,
        lng: origin.lng + (destination.lng - origin.lng) * progress
      }

      const segmentDistance = this.calculateDistance(start, end)
      const floodRisk = this.assessSegmentFloodRisk(start, end, avoidFloodZones)
      const warnings = this.getSegmentWarnings(start, end, floodRisk)

      segments.push({
        start,
        end,
        distance: segmentDistance,
        duration: this.estimateDuration(segmentDistance, 'CAR'),
        floodRisk,
        warnings
      })
    }

    return segments
  }

  /**
   * Assess flood risk for a route segment
   */
  private assessSegmentFloodRisk(
    start: Location,
    end: Location,
    avoidFloodZones: boolean
  ): RiskLevel {
    const midpoint: Location = {
      lat: (start.lat + end.lat) / 2,
      lng: (start.lng + end.lng) / 2
    }

    const floodAreas = this.riskStore.floodAreas

    // Check distance to nearest flood area
    let minDistance = Infinity
    let maxSeverity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL' = 'NONE'

    for (const flood of floodAreas) {
      const distance = this.riskStore.calculateDistance(midpoint, flood.location)
      if (distance < minDistance) {
        minDistance = distance
        maxSeverity = flood.severity
      }
    }

    // Determine risk level
    if (minDistance < 0.5) {
      if (maxSeverity === 'CRITICAL' || maxSeverity === 'SEVERE') {
        return 'CRITICAL'
      }
      return 'HIGH'
    } else if (minDistance < 2) {
      if (maxSeverity === 'CRITICAL') {
        return 'HIGH'
      }
      return 'MEDIUM'
    } else if (minDistance < 5) {
      return 'MEDIUM'
    }

    return 'LOW'
  }

  /**
   * Get warnings for a route segment
   */
  private getSegmentWarnings(
    start: Location,
    end: Location,
    floodRisk: RiskLevel
  ): string[] {
    const warnings: string[] = []

    if (floodRisk === 'CRITICAL') {
      warnings.push('พื้นที่น้ำท่วมหนัก - ไม่แนะนำให้ผ่าน')
      warnings.push('ควรเลือกเส้นทางอื่น')
    } else if (floodRisk === 'HIGH') {
      warnings.push('พบพื้นที่น้ำท่วมบนเส้นทาง')
      warnings.push('ขับขี่ด้วยความระมัดระวัง')
    } else if (floodRisk === 'MEDIUM') {
      warnings.push('มีพื้นที่น้ำท่วมใกล้เคียง')
      warnings.push('ติดตามสถานการณ์อย่างใกล้ชิด')
    }

    return warnings
  }

  /**
   * Assess overall route risk
   */
  private assessRouteRisk(segments: RouteSegment[]): import('~/types').RiskAssessment {
    const riskLevels = segments.map(s => s.floodRisk)
    const allWarnings = segments.flatMap(s => s.warnings)

    // Determine highest risk
    let level: RiskLevel = 'LOW'
    if (riskLevels.includes('CRITICAL')) {
      level = 'CRITICAL'
    } else if (riskLevels.includes('HIGH')) {
      level = 'HIGH'
    } else if (riskLevels.includes('MEDIUM')) {
      level = 'MEDIUM'
    }

    // Calculate score (inverse of risk)
    let score = 100
    const criticalCount = riskLevels.filter(r => r === 'CRITICAL').length
    const highCount = riskLevels.filter(r => r === 'HIGH').length
    const mediumCount = riskLevels.filter(r => r === 'MEDIUM').length

    score -= criticalCount * 40
    score -= highCount * 20
    score -= mediumCount * 10

    return {
      level,
      score: Math.max(0, score),
      reasons: [...new Set(allWarnings)] // Remove duplicates
    }
  }

  /**
   * Get flood areas along the route
   */
  private getFloodAreasAlongRoute(segments: RouteSegment[]): FloodArea[] {
    const floodAreas: FloodArea[] = []
    const maxDistance = 2 // km

    for (const segment of segments) {
      const midpoint: Location = {
        lat: (segment.start.lat + segment.end.lat) / 2,
        lng: (segment.start.lng + segment.end.lng) / 2
      }

      for (const flood of this.riskStore.floodAreas) {
        const distance = this.riskStore.calculateDistance(midpoint, flood.location)
        if (distance <= maxDistance && !floodAreas.find(f => f.id === flood.id)) {
          floodAreas.push(flood)
        }
      }
    }

    return floodAreas
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(from: Location, to: Location): number {
    return this.riskStore.calculateDistance(from, to)
  }

  /**
   * Estimate travel duration based on distance and vehicle type
   */
  private estimateDuration(distance: number, vehicleType: VehicleType): number {
    // Average speeds in km/h
    const speeds: Record<VehicleType, number> = {
      CAR: 60,
      PICKUP: 55,
      SUV: 55,
      VAN: 50
    }

    const speed = speeds[vehicleType] || 60
    const hours = distance / speed

    return Math.round(hours * 60) // Return minutes
  }

  /**
   * Find alternative routes avoiding flood zones
   */
  async findAlternativeRoutes(
    origin: Location,
    destination: Location,
    vehicleType: VehicleType = 'CAR'
  ): Promise<Route[]> {
    // In production, this would call routing API with multiple alternatives
    // For now, we'll create 2 alternative routes with different characteristics

    const mainRoute = await this.calculateRoute(origin, destination, vehicleType, true)
    const fastRoute = await this.calculateRoute(origin, destination, vehicleType, false)

    return [mainRoute, fastRoute]
  }

  /**
   * Check if a location is on a route
   */
  isLocationOnRoute(location: Location, route: Route, tolerance: number = 0.1): boolean {
    for (const segment of route.segments) {
      const distanceToSegment = this.distanceToLineSegment(
        location,
        segment.start,
        segment.end
      )
      if (distanceToSegment <= tolerance) {
        return true
      }
    }
    return false
  }

  /**
   * Calculate perpendicular distance from point to line segment
   */
  private distanceToLineSegment(point: Location, lineStart: Location, lineEnd: Location): number {
    const A = point.lat - lineStart.lat
    const B = point.lng - lineStart.lng
    const C = lineEnd.lat - lineStart.lat
    const D = lineEnd.lng - lineStart.lng

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) {
      param = dot / lenSq
    }

    let closestLat: number
    let closestLng: number

    if (param < 0) {
      closestLat = lineStart.lat
      closestLng = lineStart.lng
    } else if (param > 1) {
      closestLat = lineEnd.lat
      closestLng = lineEnd.lng
    } else {
      closestLat = lineStart.lat + param * C
      closestLng = lineStart.lng + param * D
    }

    return this.calculateDistance(point, { lat: closestLat, lng: closestLng })
  }
}

// Composable for easy access
export const useRouteService = () => {
  return new RouteService()
}

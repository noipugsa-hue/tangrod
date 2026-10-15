import type { Location, VehicleType, RiskLevel, RiskAssessment } from '~/types'
import type { RouteResult } from '~/services/routesService'
import { useRoutesService } from '~/services/routesService'
import { useRiskStore } from '~/stores/risk'

export interface CalculatedRoute extends RouteResult {
  id: string
  name: string
  riskAssessment: RiskAssessment
}

export const useRouteCalculation = () => {
  const routesService = useRoutesService()
  const riskStore = useRiskStore()

  /**
   * Calculate risk assessment for a route
   */
  const calculateRouteRisk = (route: RouteResult): RiskAssessment => {
    if (route.floodAreasOnRoute.length === 0) {
      return {
        level: 'LOW',
        score: 100,
        reasons: ['ไม่พบพื้นที่น้ำท่วมในเส้นทาง'],
        floodDistance: undefined,
        waterLevel: 0
      }
    }

    // Calculate risk based on flood areas
    const criticalAreas = route.floodAreasOnRoute.filter(a => a.severity === 'CRITICAL')
    const severeAreas = route.floodAreasOnRoute.filter(a => a.severity === 'SEVERE')
    const moderateAreas = route.floodAreasOnRoute.filter(a => a.severity === 'MODERATE')

    let level: RiskLevel = 'LOW'
    let score = 100
    const reasons: string[] = []

    if (criticalAreas.length > 0) {
      level = 'CRITICAL'
      score = 20
      reasons.push(`พบพื้นที่น้ำท่วมรุนแรง ${criticalAreas.length} จุด`)
    } else if (severeAreas.length > 0) {
      level = 'HIGH'
      score = 40
      reasons.push(`พบพื้นที่น้ำท่วมสูง ${severeAreas.length} จุด`)
    } else if (moderateAreas.length > 0) {
      level = 'MEDIUM'
      score = 60
      reasons.push(`พบพื้นที่น้ำท่วมปานกลาง ${moderateAreas.length} จุด`)
    }

    // Find max water level
    const maxWaterLevel = Math.max(...route.floodAreasOnRoute.map(a => a.waterLevel))

    return {
      level,
      score,
      reasons,
      floodDistance: 0, // Distance to nearest flood could be calculated if needed
      waterLevel: maxWaterLevel
    }
  }

  /**
   * Get risk score for sorting
   */
  const getRiskScore = (level: RiskLevel): number => {
    switch (level) {
      case 'LOW':
        return 0
      case 'MEDIUM':
        return 1
      case 'HIGH':
        return 2
      case 'CRITICAL':
        return 3
      default:
        return 0
    }
  }

  /**
   * Calculate route from origin to destination
   */
  const calculateRoute = async (
    origin: Location,
    destination: Location,
    vehicleType: VehicleType = 'CAR',
    avoidFloodZones: boolean = true
  ): Promise<CalculatedRoute[]> => {
    try {
      // Get alternative routes from Google Directions API
      const routes = await routesService.calculateAlternativeRoutes({
        origin,
        destination,
        travelMode: 'DRIVING',
        avoidFloodAreas: avoidFloodZones
      })

      // Calculate risk assessment for each route
      const calculatedRoutes: CalculatedRoute[] = routes.map((route, index) => {
        const riskAssessment = calculateRouteRisk(route)

        return {
          ...route,
          id: `route-${index}`,
          name: index === 0 ? 'เส้นทางหลัก' : `เส้นทางรอง ${index}`,
          riskAssessment
        }
      })

      // Sort by safety (risk level) then duration
      calculatedRoutes.sort((a, b) => {
        const riskDiff = getRiskScore(a.riskAssessment.level) - getRiskScore(b.riskAssessment.level)
        if (riskDiff !== 0) return riskDiff
        return a.duration - b.duration
      })

      // Rename routes after sorting
      calculatedRoutes.forEach((route, index) => {
        route.name = index === 0 ? 'เส้นทางที่แนะนำ' : `เส้นทางทางเลือก ${index}`
      })

      return calculatedRoutes
    } catch (error) {
      console.error('Error calculating route:', error)
      throw error
    }
  }

  /**
   * Calculate single route (no alternatives)
   */
  const calculateSingleRoute = async (
    origin: Location,
    destination: Location,
    vehicleType: VehicleType = 'CAR'
  ): Promise<CalculatedRoute | null> => {
    try {
      const route = await routesService.calculateRoute({
        origin,
        destination,
        travelMode: 'DRIVING',
        avoidFloodAreas: false
      })

      if (!route) return null

      const riskAssessment = calculateRouteRisk(route)

      return {
        ...route,
        id: 'route-0',
        name: 'เส้นทางหลัก',
        riskAssessment
      }
    } catch (error) {
      console.error('Error calculating single route:', error)
      return null
    }
  }

  /**
   * Format distance for display
   */
  const formatDistance = (meters: number): string => {
    const km = meters / 1000
    if (km < 1) {
      return `${Math.round(meters)} ม.`
    }
    return `${km.toFixed(1)} กม.`
  }

  /**
   * Format duration for display
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`
    }
    return `${minutes} นาที`
  }

  /**
   * Get route color by risk level
   */
  const getRouteColor = (level: RiskLevel): string => {
    switch (level) {
      case 'LOW':
        return '#10B981' // Green
      case 'MEDIUM':
        return '#FBBF24' // Yellow
      case 'HIGH':
        return '#F59E0B' // Orange
      case 'CRITICAL':
        return '#EF4444' // Red
      default:
        return '#6B7280' // Gray
    }
  }

  return {
    calculateRoute,
    calculateSingleRoute,
    calculateRouteRisk,
    getRiskScore,
    formatDistance,
    formatDuration,
    getRouteColor
  }
}

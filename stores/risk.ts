import { defineStore } from 'pinia'
import type { Location, RiskAssessment, RiskLevel, FloodArea } from '~/types'
import type { GeoJSONGeometry } from '~/types/gistda'

export const useRiskStore = defineStore('risk', {
  state: () => ({
    currentRisk: null as RiskAssessment | null,
    floodAreas: [] as FloodArea[],
    loading: false
  }),

  getters: {
    riskColor(): string {
      if (!this.currentRisk) return 'gray'

      switch (this.currentRisk.level) {
        case 'LOW':
          return 'success'
        case 'MEDIUM':
          return 'warning'
        case 'HIGH':
          return 'danger'
        case 'CRITICAL':
          return 'danger'
        default:
          return 'gray'
      }
    },

    riskLabel(): string {
      if (!this.currentRisk) return 'ไม่ทราบ'

      switch (this.currentRisk.level) {
        case 'LOW':
          return 'ความเสี่ยงต่ำ'
        case 'MEDIUM':
          return 'ควรเฝ้าระวัง'
        case 'HIGH':
          return 'ความเสี่ยงสูง'
        case 'CRITICAL':
          return 'อันตราย'
        default:
          return 'ไม่ทราบ'
      }
    }
  },

  actions: {
    async assessRisk(location: Location): Promise<RiskAssessment> {
      this.loading = true

      try {
        let score = 100
        const reasons: string[] = []
        let closestFlood: FloodArea | null = null
        let minDistance = Infinity

        // Check each flood area
        for (const flood of this.floodAreas) {
          // Priority 1: Check if point is inside a flood polygon (GISTDA data)
          if (flood.geometry && this.isPointInPolygon(location, flood.geometry)) {
            score = 0
            reasons.push(`คุณอยู่ในพื้นที่น้ำท่วม (${this.getSeverityLabel(flood.severity)})`)
            closestFlood = flood

            // Adjust for severity when inside polygon
            if (flood.severity === 'CRITICAL') {
              reasons.push('ระดับน้ำสูงมาก - อพยพทันที')
            } else if (flood.severity === 'SEVERE') {
              reasons.push('ระดับน้ำสูง - ควรอพยพ')
            }
            break // Already inside flood area, highest risk
          }

          // Priority 2: Calculate distance to flood center
          const distance = this.calculateDistance(location, flood.location)

          if (distance < minDistance) {
            minDistance = distance
            closestFlood = flood
          }

          // Apply distance-based scoring (for areas not inside polygon)
          if (distance <= flood.radius + 5) {
            if (distance <= 1) {
              score -= 60
              reasons.push(`ใกล้พื้นที่น้ำท่วม ${distance.toFixed(1)} กม.`)
            } else if (distance <= 3) {
              score -= 40
              reasons.push(`ห่างจากพื้นที่น้ำท่วม ${distance.toFixed(1)} กม.`)
            } else if (distance <= 5) {
              score -= 20
              reasons.push(`มีพื้นที่น้ำท่วมในระยะ ${distance.toFixed(1)} กม.`)
            }

            // Severity adjustments
            if (flood.severity === 'CRITICAL') {
              score -= 20
              reasons.push('ระดับน้ำรุนแรง')
            } else if (flood.severity === 'SEVERE') {
              score -= 10
              reasons.push('ระดับน้ำสูง')
            }
          }
        }

        // If no flood areas detected
        if (reasons.length === 0) {
          reasons.push('ไม่พบพื้นที่น้ำท่วมใกล้เคียง')
        }

        // Determine risk level
        let level: RiskLevel = 'LOW'
        if (score < 30) {
          level = 'CRITICAL'
        } else if (score < 50) {
          level = 'HIGH'
        } else if (score < 70) {
          level = 'MEDIUM'
        } else {
          level = 'LOW'
        }

        const assessment: RiskAssessment = {
          level,
          score: Math.max(0, score),
          reasons,
          floodDistance: minDistance < Infinity ? minDistance : undefined,
          waterLevel: closestFlood?.waterLevel
        }

        this.currentRisk = assessment
        return assessment
      } finally {
        this.loading = false
      }
    },

    calculateDistance(from: Location, to: Location): number {
      // Haversine formula
      const R = 6371 // Earth's radius in km
      const dLat = this.toRad(to.lat - from.lat)
      const dLon = this.toRad(to.lng - from.lng)
      const lat1 = this.toRad(from.lat)
      const lat2 = this.toRad(to.lat)

      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c
    },

    toRad(deg: number): number {
      return deg * (Math.PI / 180)
    },

    /**
     * Check if a point is inside a polygon using ray casting algorithm
     *
     * Note: GeoJSON coordinates are [longitude, latitude], but our Location type is {lat, lng}
     */
    isPointInPolygon(point: Location, geometry: GeoJSONGeometry): boolean {
      if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
        return false
      }

      const polygons = geometry.type === 'Polygon'
        ? [geometry.coordinates as number[][][]]
        : geometry.coordinates as number[][][][]

      for (const polygon of polygons) {
        const ring = polygon[0] // exterior ring
        let inside = false

        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          // GeoJSON format: [lng, lat]
          const lngI = ring[i][0], latI = ring[i][1]
          const lngJ = ring[j][0], latJ = ring[j][1]

          // Ray casting algorithm
          const intersect = ((latI > point.lat) !== (latJ > point.lat))
            && (point.lng < (lngJ - lngI) * (point.lat - latI) / (latJ - latI) + lngI)

          if (intersect) inside = !inside
        }

        if (inside) return true
      }

      return false
    },

    /**
     * Get severity label in Thai
     */
    getSeverityLabel(severity: string): string {
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
    },

    setFloodAreas(areas: FloodArea[]) {
      this.floodAreas = areas
    },

    addFloodArea(area: FloodArea) {
      this.floodAreas.push(area)
    }
  }
})

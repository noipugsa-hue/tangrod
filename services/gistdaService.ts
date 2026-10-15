/**
 * GISTDA Flood Service
 *
 * Client-side service for fetching and transforming GISTDA flood data
 * from the internal API endpoint.
 */

import type { GISTDAFloodResponse, GISTDAFloodFeature, GeoJSONGeometry } from '~/types/gistda'
import type { FloodArea, FloodSeverity, Location } from '~/types'

export class GISTDAService {
  /**
   * Fetch flood data from internal API (which proxies GISTDA)
   */
  async getFloodData(): Promise<GISTDAFloodResponse> {
    try {
      const data = await $fetch<GISTDAFloodResponse>('/api/flood/gistda')
      return data
    } catch (error) {
      console.error('[GISTDA Service] Failed to fetch flood data:', error)
      throw error
    }
  }

  /**
   * Convert GISTDA GeoJSON features to FloodArea objects
   */
  convertToFloodAreas(response: GISTDAFloodResponse): FloodArea[] {
    if (!response.features || response.features.length === 0) {
      return []
    }

    return response.features.map((feature, index) => {
      // Extract center point from geometry
      const center = this.getGeometryCenter(feature.geometry)

      // Calculate approximate radius from bounding box
      const radius = feature.bbox
        ? this.calculateRadiusFromBbox(feature.bbox)
        : 1 // default 1km

      // Determine severity from feature properties
      const severity = this.determineSeverity(feature.properties)

      // Parse datetime
      const reportedAt = feature.properties.datetime
        ? new Date(feature.properties.datetime)
        : new Date()

      return {
        id: feature.id || `gistda-${index}`,
        location: center,
        severity,
        waterLevel: 0, // GISTDA doesn't provide exact water level
        radius,
        reportedAt,
        updatedAt: new Date(),
        verified: true,
        geometry: feature.geometry,
        source: 'gistda'
      }
    })
  }

  /**
   * Calculate center point of a GeoJSON geometry
   */
  private getGeometryCenter(geometry: GeoJSONGeometry): Location {
    if (geometry.type === 'Point') {
      const coords = geometry.coordinates as number[]
      return { lat: coords[1], lng: coords[0] }
    }

    if (geometry.type === 'Polygon') {
      const coords = geometry.coordinates as number[][][]
      const ring = coords[0]
      return this.calculateCentroid(ring)
    }

    if (geometry.type === 'MultiPolygon') {
      const coords = geometry.coordinates as number[][][][]
      const firstRing = coords[0][0]
      return this.calculateCentroid(firstRing)
    }

    // Fallback to Thailand center (Bangkok)
    console.warn('[GISTDA Service] Unknown geometry type, using fallback location')
    return { lat: 13.7563, lng: 100.5018 }
  }

  /**
   * Calculate centroid of a polygon ring
   */
  private calculateCentroid(ring: number[][]): Location {
    let lat = 0
    let lng = 0
    const pointCount = ring.length

    ring.forEach(point => {
      lng += point[0]
      lat += point[1]
    })

    return {
      lat: lat / pointCount,
      lng: lng / pointCount
    }
  }

  /**
   * Calculate radius (in km) from bounding box
   */
  private calculateRadiusFromBbox(bbox: [number, number, number, number]): number {
    const [minLng, minLat, maxLng, maxLat] = bbox

    // Calculate width and height in degrees
    const width = maxLng - minLng
    const height = maxLat - minLat

    // Calculate diagonal distance using Pythagorean theorem
    const diagDegrees = Math.sqrt(width * width + height * height)

    // Rough conversion: 1 degree ≈ 111 km at equator
    // Use half diagonal as radius
    return (diagDegrees * 111) / 2
  }

  /**
   * Determine flood severity from GISTDA feature properties
   *
   * Note: This is placeholder logic. Adjust based on actual GISTDA
   * property mappings once we understand their data schema better.
   */
  private determineSeverity(properties: Record<string, unknown>): FloodSeverity {
    // Check for cloud cover as a proxy (may need to be updated)
    const cloudCover = properties['eo:cloud_cover'] as number | undefined

    if (cloudCover !== undefined) {
      if (cloudCover > 80) return 'CRITICAL'
      if (cloudCover > 60) return 'SEVERE'
      if (cloudCover > 40) return 'MODERATE'
      if (cloudCover > 20) return 'MINOR'
    }

    // Check for other potential severity indicators
    // TODO: Update this logic based on actual GISTDA data structure

    // Default to MODERATE for detected flood areas
    return 'MODERATE'
  }

  /**
   * Get color for flood severity (for map visualization)
   */
  getFloodColor(severity: FloodSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return '#DC2626' // red-600
      case 'SEVERE':
        return '#EA580C' // orange-600
      case 'MODERATE':
        return '#F59E0B' // amber-500
      case 'MINOR':
        return '#EAB308' // yellow-500
      case 'NONE':
      default:
        return '#3B82F6' // blue-500
    }
  }
}

/**
 * Composable to use GISTDA service
 */
export const useGISTDAService = (): GISTDAService => {
  return new GISTDAService()
}

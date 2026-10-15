import type { Location } from '~/types'

export interface GoogleMapsConfig {
  apiKey: string
  libraries?: string[]
  region?: string
  language?: string
}

export type MapMode = 'standard' | 'satellite' | 'hybrid' | 'terrain'
export type Map3DMode = boolean

export interface MapOptions {
  center: Location
  zoom: number
  mapId?: string
  mode?: MapMode
  is3D?: boolean
  tilt?: number
  heading?: number
}

export interface FloodOverlayOptions {
  id: string
  location: Location
  radius: number
  severity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  waterLevel: number
  verified: boolean
}

class GoogleMapsService {
  private apiKey: string = ''
  private isLoaded = false
  private isLoading = false
  private loadPromise: Promise<void> | null = null
  private map: google.maps.Map | null = null
  private markers: google.maps.Marker[] = []
  private overlays: google.maps.Circle[] = []
  private geoJsonOverlays: google.maps.Data[] = []

  constructor() {
    // API key will be retrieved when needed
  }

  /**
   * Get API key from runtime config
   */
  private getApiKey(): string {
    if (!this.apiKey && process.client) {
      const config = useRuntimeConfig()
      this.apiKey = config.public.googleMapsApiKey as string || ''
      console.log('[GoogleMaps] API Key loaded:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'MISSING')
    }
    return this.apiKey
  }

  /**
   * Lazy load Google Maps API
   */
  async loadGoogleMaps(libraries: string[] = ['marker', 'places', 'routes', 'geometry']): Promise<void> {
    if (this.isLoaded) return

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise
    }

    this.isLoading = true
    this.loadPromise = new Promise((resolve, reject) => {
      const apiKey = this.getApiKey()
      if (!apiKey) {
        reject(new Error('Google Maps API key is not configured'))
        return
      }

      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        this.isLoaded = true
        this.isLoading = false
        resolve()
        return
      }

      const script = document.createElement('script')
      const librariesParam = libraries.join(',')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&loading=async&v=weekly`
      script.async = true
      script.defer = true

      script.onload = () => {
        // Wait for google.maps to be fully initialized
        let attempts = 0
        const maxAttempts = 50 // 5 seconds max
        const checkGoogleMaps = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            this.isLoaded = true
            this.isLoading = false
            resolve()
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(checkGoogleMaps, 100)
          } else {
            this.isLoading = false
            reject(new Error('Google Maps API initialization timeout'))
          }
        }
        checkGoogleMaps()
      }

      script.onerror = () => {
        this.isLoading = false
        reject(new Error('Failed to load Google Maps API'))
      }

      document.head.appendChild(script)
    })

    return this.loadPromise
  }

  /**
   * Initialize map
   */
  async initMap(container: HTMLElement, options: MapOptions): Promise<google.maps.Map> {
    await this.loadGoogleMaps()

    const mapOptions: google.maps.MapOptions = {
      center: { lat: options.center.lat, lng: options.center.lng },
      zoom: options.zoom,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
      },
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false, // Custom controls
      gestureHandling: 'greedy',
      restriction: {
        latLngBounds: {
          north: 21.0,
          south: 5.0,
          west: 97.0,
          east: 106.0
        },
        strictBounds: false
      }
    }

    // Set map type based on mode
    if (options.mode === 'satellite') {
      mapOptions.mapTypeId = google.maps.MapTypeId.SATELLITE
    } else if (options.mode === 'hybrid') {
      mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID
    } else if (options.mode === 'terrain') {
      mapOptions.mapTypeId = google.maps.MapTypeId.TERRAIN
    } else {
      mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP
    }

    // 3D options
    if (options.is3D) {
      mapOptions.tilt = options.tilt || 45
      mapOptions.heading = options.heading || 0
    }

    this.map = new google.maps.Map(container, mapOptions)
    return this.map
  }

  /**
   * Switch map mode
   */
  setMapMode(mode: MapMode): void {
    if (!this.map) return

    switch (mode) {
      case 'satellite':
        this.map.setMapTypeId(google.maps.MapTypeId.SATELLITE)
        break
      case 'hybrid':
        this.map.setMapTypeId(google.maps.MapTypeId.HYBRID)
        break
      case 'terrain':
        this.map.setMapTypeId(google.maps.MapTypeId.TERRAIN)
        break
      default:
        this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP)
    }
  }

  /**
   * Enable 3D mode
   */
  enable3D(tilt: number = 45, heading: number = 0): void {
    if (!this.map) return

    this.map.setTilt(tilt)
    this.map.setHeading(heading)
  }

  /**
   * Disable 3D mode
   */
  disable3D(): void {
    if (!this.map) return

    this.map.setTilt(0)
    this.map.setHeading(0)
  }

  /**
   * Add flood overlay
   */
  addFloodOverlay(options: FloodOverlayOptions): google.maps.Circle {
    if (!this.map) throw new Error('Map not initialized')

    const color = this.getFloodColor(options.severity)

    const circle = new google.maps.Circle({
      map: this.map,
      center: { lat: options.location.lat, lng: options.location.lng },
      radius: options.radius * 1000, // km to meters
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.3,
      clickable: true
    })

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">${this.getSeverityLabel(options.severity)}</h3>
          <p style="font-size: 14px; margin: 4px 0;">ระดับน้ำ: ${options.waterLevel} ซม.</p>
          <p style="font-size: 12px; color: #666; margin: 4px 0;">${options.verified ? '✓ ยืนยันแล้ว' : '⏳ รอการยืนยัน'}</p>
        </div>
      `,
      position: { lat: options.location.lat, lng: options.location.lng }
    })

    circle.addListener('click', () => {
      infoWindow.open(this.map!)
    })

    this.overlays.push(circle)
    return circle
  }

  /**
   * Add marker
   */
  async addMarker(
    location: Location,
    options?: {
      title?: string
      icon?: string
      content?: string
    }
  ): Promise<google.maps.Marker> {
    if (!this.map) throw new Error('Map not initialized')

    const marker = new google.maps.Marker({
      map: this.map,
      position: { lat: location.lat, lng: location.lng },
      title: options?.title
    })

    if (options?.content) {
      const infoWindow = new google.maps.InfoWindow({
        content: options.content
      })

      marker.addListener('click', () => {
        infoWindow.open(this.map!, marker)
      })
    }

    this.markers.push(marker)
    return marker
  }

  /**
   * Center map
   */
  setCenter(location: Location, zoom?: number): void {
    if (!this.map) return

    this.map.panTo({ lat: location.lat, lng: location.lng })
    if (zoom) {
      this.map.setZoom(zoom)
    }
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    if (!this.map) return
    const currentZoom = this.map.getZoom() || 10
    this.map.setZoom(currentZoom + 1)
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    if (!this.map) return
    const currentZoom = this.map.getZoom() || 10
    this.map.setZoom(currentZoom - 1)
  }

  /**
   * Add GeoJSON flood overlay to map
   *
   * Displays a GeoJSON feature (polygon/multipolygon) on the map
   * with styling based on flood severity.
   */
  addGeoJSONFloodOverlay(
    feature: {
      type: 'Feature'
      id: string
      geometry: {
        type: string
        coordinates: number[] | number[][] | number[][][] | number[][][][]
      }
      properties: Record<string, unknown>
    },
    severity: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL'
  ): google.maps.Data {
    if (!this.map) {
      throw new Error('Map not initialized')
    }

    const dataLayer = new google.maps.Data({ map: this.map })

    // Add the GeoJSON feature
    dataLayer.addGeoJson({
      type: 'Feature',
      id: feature.id,
      geometry: feature.geometry,
      properties: feature.properties
    } as google.maps.Data.GeoJsonObject)

    // Style the feature based on severity
    const color = this.getFloodColor(severity)
    dataLayer.setStyle({
      fillColor: color,
      fillOpacity: 0.4,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2
    })

    this.geoJsonOverlays.push(dataLayer)
    return dataLayer
  }

  /**
   * Clear all GeoJSON overlays
   */
  clearGeoJSONOverlays(): void {
    this.geoJsonOverlays.forEach(layer => {
      layer.setMap(null)
    })
    this.geoJsonOverlays = []
  }

  /**
   * Clear all markers
   */
  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null))
    this.markers = []
  }

  /**
   * Clear all overlays (circles and GeoJSON)
   */
  clearOverlays(): void {
    // Clear circle overlays
    this.overlays.forEach(overlay => overlay.setMap(null))
    this.overlays = []

    // Clear GeoJSON overlays
    this.clearGeoJSONOverlays()
  }

  /**
   * Get map instance
   */
  getMap(): google.maps.Map | null {
    return this.map
  }

  /**
   * Get flood color by severity
   */
  private getFloodColor(severity: string): string {
    switch (severity) {
      case 'NONE':
        return '#10B981' // Green
      case 'MINOR':
        return '#3B82F6' // Blue
      case 'MODERATE':
        return '#FBBF24' // Yellow
      case 'SEVERE':
        return '#F59E0B' // Orange
      case 'CRITICAL':
        return '#EF4444' // Red
      default:
        return '#6B7280' // Gray
    }
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
}

// Export singleton instance
export const useGoogleMapsService = () => {
  return new GoogleMapsService()
}

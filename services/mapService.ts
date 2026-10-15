import type { Location, FloodArea, EmergencyPlace, FloodSeverity } from '~/types'
import L from 'leaflet'

export interface MapLayer {
  id: string
  name: string
  enabled: boolean
  type: 'flood' | 'emergency' | 'route' | 'marker'
}

export interface MapOptions {
  center: Location
  zoom: number
  minZoom?: number
  maxZoom?: number
}

export class MapService {
  private map: L.Map | null = null
  private layers: Map<string, L.LayerGroup> = new Map()
  private markers: Map<string, L.Marker> = new Map()

  /**
   * Initialize Leaflet map
   */
  initMap(container: HTMLElement, options: MapOptions): L.Map {
    this.map = L.map(container).setView(
      [options.center.lat, options.center.lng],
      options.zoom
    )

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      minZoom: options.minZoom || 5,
      maxZoom: options.maxZoom || 18
    }).addTo(this.map)

    // Initialize layer groups
    this.layers.set('flood', L.layerGroup().addTo(this.map))
    this.layers.set('emergency', L.layerGroup().addTo(this.map))
    this.layers.set('route', L.layerGroup().addTo(this.map))
    this.layers.set('markers', L.layerGroup().addTo(this.map))

    return this.map
  }

  /**
   * Get map instance
   */
  getMap(): L.Map | null {
    return this.map
  }

  /**
   * Set map center
   */
  setCenter(location: Location, zoom?: number): void {
    if (!this.map) return
    this.map.setView([location.lat, location.lng], zoom || this.map.getZoom())
  }

  /**
   * Add flood area to map
   */
  addFloodArea(flood: FloodArea): L.Circle {
    if (!this.map) throw new Error('Map not initialized')

    const color = this.getFloodColor(flood.severity)
    const circle = L.circle([flood.location.lat, flood.location.lng], {
      radius: flood.radius * 1000, // Convert km to meters
      color,
      fillColor: color,
      fillOpacity: 0.3,
      weight: 2
    })

    const popup = L.popup().setContent(`
      <div class="p-2">
        <h3 class="font-semibold">${this.getFloodSeverityLabel(flood.severity)}</h3>
        <p class="text-sm">ระดับน้ำ: ${flood.waterLevel} ซม.</p>
        <p class="text-xs text-gray-500">รัศมี: ${flood.radius} กม.</p>
      </div>
    `)

    circle.bindPopup(popup)

    const layer = this.layers.get('flood')
    if (layer) {
      circle.addTo(layer)
    }

    return circle
  }

  /**
   * Add multiple flood areas
   */
  addFloodAreas(floods: FloodArea[]): void {
    floods.forEach(flood => this.addFloodArea(flood))
  }

  /**
   * Clear flood layer
   */
  clearFloodAreas(): void {
    const layer = this.layers.get('flood')
    if (layer) {
      layer.clearLayers()
    }
  }

  /**
   * Add emergency place marker
   */
  addEmergencyPlace(place: EmergencyPlace): L.Marker {
    if (!this.map) throw new Error('Map not initialized')

    const icon = this.getEmergencyIcon(place.type)
    const marker = L.marker([place.location.lat, place.location.lng], { icon })

    const popup = L.popup().setContent(`
      <div class="p-2">
        <h3 class="font-semibold">${place.name}</h3>
        <p class="text-sm">${place.address.district}, ${place.address.province}</p>
        ${place.phone ? `<p class="text-sm">โทร: ${place.phone}</p>` : ''}
        ${place.openingHours ? `<p class="text-xs text-gray-500">${place.openingHours}</p>` : ''}
      </div>
    `)

    marker.bindPopup(popup)

    const layer = this.layers.get('emergency')
    if (layer) {
      marker.addTo(layer)
    }

    this.markers.set(`emergency-${place.id}`, marker)

    return marker
  }

  /**
   * Add multiple emergency places
   */
  addEmergencyPlaces(places: EmergencyPlace[]): void {
    places.forEach(place => this.addEmergencyPlace(place))
  }

  /**
   * Clear emergency layer
   */
  clearEmergencyPlaces(): void {
    const layer = this.layers.get('emergency')
    if (layer) {
      layer.clearLayers()
    }
    this.markers.forEach((marker, key) => {
      if (key.startsWith('emergency-')) {
        this.markers.delete(key)
      }
    })
  }

  /**
   * Add user location marker
   */
  addUserMarker(location: Location, label?: string): L.Marker {
    if (!this.map) throw new Error('Map not initialized')

    const icon = L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
        </div>
      `,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    const marker = L.marker([location.lat, location.lng], { icon })

    if (label) {
      marker.bindPopup(label)
    }

    const layer = this.layers.get('markers')
    if (layer) {
      marker.addTo(layer)
    }

    this.markers.set('user', marker)

    return marker
  }

  /**
   * Update user marker position
   */
  updateUserMarker(location: Location): void {
    const marker = this.markers.get('user')
    if (marker) {
      marker.setLatLng([location.lat, location.lng])
    } else {
      this.addUserMarker(location)
    }
  }

  /**
   * Add route polyline
   */
  addRoute(points: Location[], color: string = '#3B82F6'): L.Polyline {
    if (!this.map) throw new Error('Map not initialized')

    const latLngs: L.LatLngExpression[] = points.map(p => [p.lat, p.lng])
    const polyline = L.polyline(latLngs, {
      color,
      weight: 4,
      opacity: 0.7
    })

    const layer = this.layers.get('route')
    if (layer) {
      polyline.addTo(layer)
    }

    return polyline
  }

  /**
   * Clear route layer
   */
  clearRoutes(): void {
    const layer = this.layers.get('route')
    if (layer) {
      layer.clearLayers()
    }
  }

  /**
   * Toggle layer visibility
   */
  toggleLayer(layerId: string, enabled: boolean): void {
    const layer = this.layers.get(layerId)
    if (!layer || !this.map) return

    if (enabled) {
      layer.addTo(this.map)
    } else {
      layer.remove()
    }
  }

  /**
   * Fit bounds to show all markers
   */
  fitBounds(locations: Location[], padding: number = 50): void {
    if (!this.map || locations.length === 0) return

    const bounds = L.latLngBounds(
      locations.map(l => [l.lat, l.lng] as L.LatLngExpression)
    )

    this.map.fitBounds(bounds, { padding: [padding, padding] })
  }

  /**
   * Get flood color based on severity
   */
  private getFloodColor(severity: FloodSeverity): string {
    const colors: Record<FloodSeverity, string> = {
      NONE: '#10B981',
      MINOR: '#3B82F6',
      MODERATE: '#F59E0B',
      SEVERE: '#F97316',
      CRITICAL: '#EF4444'
    }
    return colors[severity] || colors.NONE
  }

  /**
   * Get flood severity label in Thai
   */
  private getFloodSeverityLabel(severity: FloodSeverity): string {
    const labels: Record<FloodSeverity, string> = {
      NONE: 'ไม่มีน้ำท่วม',
      MINOR: 'น้ำท่วมเล็กน้อย',
      MODERATE: 'น้ำท่วมปานกลาง',
      SEVERE: 'น้ำท่วมหนัก',
      CRITICAL: 'น้ำท่วมหนักมาก'
    }
    return labels[severity] || labels.NONE
  }

  /**
   * Get emergency place icon
   */
  private getEmergencyIcon(type: import('~/types').EmergencyPlaceType): L.DivIcon {
    const icons: Record<import('~/types').EmergencyPlaceType, string> = {
      HOSPITAL: '🏥',
      POLICE: '👮',
      FIRE_STATION: '🚒',
      SHELTER: '🏠',
      GAS_STATION: '⛽'
    }

    const colors: Record<import('~/types').EmergencyPlaceType, string> = {
      HOSPITAL: 'bg-red-500',
      POLICE: 'bg-blue-500',
      FIRE_STATION: 'bg-orange-500',
      SHELTER: 'bg-green-500',
      GAS_STATION: 'bg-yellow-500'
    }

    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-8 h-8 ${colors[type]} rounded-full shadow-lg text-white text-xl border-2 border-white">
          ${icons[type]}
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    })
  }

  /**
   * Destroy map instance
   */
  destroy(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.layers.clear()
    this.markers.clear()
  }
}

// Composable for easy access
export const useMapService = () => {
  return new MapService()
}

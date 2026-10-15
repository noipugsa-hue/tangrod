<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import type { Location, FloodArea } from '~/types'
import 'leaflet/dist/leaflet.css'

interface Props {
  center?: Location
  zoom?: number
  floodAreas?: FloodArea[]
  markers?: Array<{ location: Location; label?: string; type?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: 13.4167, lng: 99.9500 }), // Amphawa, Samut Songkhram
  zoom: 12,
  floodAreas: () => [],
  markers: () => []
})

const emit = defineEmits<{
  mapReady: [map: any]
  markerClick: [location: Location]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let L: any = null

onMounted(async () => {
  if (!process.client) return

  // Dynamically import Leaflet (client-side only)
  L = await import('leaflet')

  // Fix Leaflet icon paths
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  // Initialize map
  if (mapContainer.value) {
    map = L.map(mapContainer.value, {
      zoomControl: false, // We'll add custom controls
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      maxBounds: [
        [5.0, 97.0],  // Southwest Thailand
        [21.0, 106.0] // Northeast Thailand
      ],
      minZoom: 6,
      maxZoom: 18,
      maxBoundsViscosity: 0.5 // Makes bounds feel smooth
    }).setView([props.center.lat, props.center.lng], props.zoom)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    // Add flood areas
    addFloodAreas()

    // Add markers
    addMarkers()

    emit('mapReady', map)
  }
})

const addFloodAreas = () => {
  if (!L || !map) return

  props.floodAreas.forEach(area => {
    const color = getFloodColor(area.severity)
    const circle = L.circle([area.location.lat, area.location.lng], {
      radius: area.radius * 1000, // Convert km to meters
      color: color,
      fillColor: color,
      fillOpacity: 0.3,
      weight: 2
    }).addTo(map)

    circle.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold mb-1">${getSeverityLabel(area.severity)}</h3>
        <p class="text-sm">ระดับน้ำ: ${area.waterLevel} ซม.</p>
        <p class="text-xs text-gray-600 mt-1">${area.verified ? 'ยืนยันแล้ว' : 'รอการยืนยัน'}</p>
      </div>
    `)
  })
}

const addMarkers = () => {
  if (!L || !map) return

  props.markers.forEach(marker => {
    const m = L.marker([marker.location.lat, marker.location.lng]).addTo(map)

    if (marker.label) {
      m.bindPopup(marker.label)
    }

    m.on('click', () => {
      emit('markerClick', marker.location)
    })
  })
}

const getFloodColor = (severity: string): string => {
  switch (severity) {
    case 'NONE':
      return '#10B981' // Green
    case 'MINOR':
      return '#FBBF24' // Yellow
    case 'MODERATE':
      return '#F59E0B' // Orange
    case 'SEVERE':
      return '#EF4444' // Red
    case 'CRITICAL':
      return '#991B1B' // Dark Red
    default:
      return '#6B7280' // Gray
  }
}

const getSeverityLabel = (severity: string): string => {
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

// Methods to control map from parent
const setCenter = (location: Location, zoom?: number) => {
  if (map) {
    map.setView([location.lat, location.lng], zoom || map.getZoom())
  }
}

const addMarker = (location: Location, label?: string) => {
  if (L && map) {
    const marker = L.marker([location.lat, location.lng]).addTo(map)
    if (label) {
      marker.bindPopup(label)
    }
    return marker
  }
}

defineExpose({
  setCenter,
  addMarker,
  map
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
  }
})

// Watch for changes in floodAreas and markers
watch(() => props.floodAreas, () => {
  if (map) {
    // Clear existing layers and re-add
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Circle) {
        map.removeLayer(layer)
      }
    })
    addFloodAreas()
  }
}, { deep: true })

watch(() => props.markers, () => {
  if (map) {
    // Clear existing markers and re-add
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })
    addMarkers()
  }
}, { deep: true })
</script>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
}
</style>

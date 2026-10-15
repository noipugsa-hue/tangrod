<template>
  <div class="relative w-full h-96">
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Timestamp Display -->
    <div
      v-if="radarTimestamps.length > 0"
      class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg z-[1000]"
    >
      <div class="text-xs text-gray-600 mb-1">เวลาภาพเรดาร์</div>
      <div class="text-sm font-semibold text-gray-900">
        {{ formatRadarTime(currentRadarTime) }}
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
    >
      <div class="bg-white px-4 py-3 rounded-lg shadow-lg">
        <div class="flex items-center gap-2">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span class="text-sm text-gray-700">กำลังโหลดเรดาร์...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Location } from '~/types'

interface Props {
  center: Location
  zoom?: number
  isPlaying?: boolean
}

interface RainViewerResponse {
  host: string
  radar: {
    past: Array<{
      time: number
      path: string
    }>
    nowcast: Array<{
      time: number
      path: string
    }>
  }
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 8,
  isPlaying: false
})

const emit = defineEmits<{
  'update:is-playing': [value: boolean]
}>()

// State
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<any>(null)
const radarLayers = ref<any[]>([])
const radarTimestamps = ref<Array<{ time: number; path: string }>>([])
const currentRadarIndex = ref(0)
const currentRadarTime = ref<number>(Date.now())
const loading = ref(true)
const animationInterval = ref<NodeJS.Timeout | null>(null)

// Load Leaflet dynamically
const loadLeaflet = async () => {
  if (typeof window === 'undefined') return null

  // Load Leaflet CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  // Load Leaflet JS
  const L = await import('leaflet')
  return L.default || L
}

// Fetch RainViewer radar data
const fetchRadarData = async () => {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json')
    const data: RainViewerResponse = await response.json()

    // Combine past and nowcast radar images
    const allRadar = [...data.radar.past, ...data.radar.nowcast]

    radarTimestamps.value = allRadar.map(item => ({
      time: item.time * 1000, // Convert to milliseconds
      path: `https://${data.host}${item.path}/256/{z}/{x}/{y}/2/1_1.png`
    }))

    return radarTimestamps.value
  } catch (error) {
    console.error('Error fetching RainViewer data:', error)
    return []
  }
}

// Initialize map
const initMap = async () => {
  if (!mapContainer.value) return

  const L = await loadLeaflet()
  if (!L) return

  // Create map
  map.value = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: true
  }).setView([props.center.lat, props.center.lng], props.zoom)

  // Add base tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map.value)

  // Add user location marker
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  L.marker([props.center.lat, props.center.lng], { icon: userIcon })
    .addTo(map.value)
    .bindPopup('ตำแหน่งของคุณ')

  // Fetch and add radar layers
  await loadRadarLayers()

  loading.value = false
}

// Load radar layers
const loadRadarLayers = async () => {
  const L = await loadLeaflet()
  if (!L || !map.value) return

  const timestamps = await fetchRadarData()
  if (timestamps.length === 0) return

  // Clear existing radar layers
  radarLayers.value.forEach(layer => layer.remove())
  radarLayers.value = []

  // Create radar layers for each timestamp
  timestamps.forEach((item, index) => {
    const layer = L.tileLayer(item.path, {
      opacity: 0,
      zIndex: 200,
      attribution: '© <a href="https://www.rainviewer.com" target="_blank">RainViewer</a>'
    })

    layer.addTo(map.value)
    radarLayers.value.push(layer)
  })

  // Show the most recent radar frame
  if (radarLayers.value.length > 0) {
    currentRadarIndex.value = radarLayers.value.length - 1
    showRadarFrame(currentRadarIndex.value)
  }
}

// Show specific radar frame
const showRadarFrame = (index: number) => {
  if (index < 0 || index >= radarLayers.value.length) return

  // Hide all layers
  radarLayers.value.forEach(layer => layer.setOpacity(0))

  // Show target layer
  radarLayers.value[index].setOpacity(0.6)

  // Update current time
  currentRadarTime.value = radarTimestamps.value[index]?.time || Date.now()
}

// Animation control
const startAnimation = () => {
  if (animationInterval.value) return

  animationInterval.value = setInterval(() => {
    currentRadarIndex.value = (currentRadarIndex.value + 1) % radarLayers.value.length
    showRadarFrame(currentRadarIndex.value)
  }, 500) // 500ms per frame
}

const stopAnimation = () => {
  if (animationInterval.value) {
    clearInterval(animationInterval.value)
    animationInterval.value = null
  }
}

// Format radar timestamp
const formatRadarTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  })
}

// Watch for play/pause changes
watch(() => props.isPlaying, (playing) => {
  if (playing) {
    startAnimation()
  } else {
    stopAnimation()
  }
})

// Watch for center changes
watch(() => props.center, (newCenter) => {
  if (map.value) {
    map.value.setView([newCenter.lat, newCenter.lng], props.zoom)
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await initMap()

  // Start animation if isPlaying is true
  if (props.isPlaying) {
    startAnimation()
  }
})

onBeforeUnmount(() => {
  stopAnimation()

  if (map.value) {
    map.value.remove()
    map.value = null
  }
})
</script>

<style scoped>
:deep(.leaflet-control-attribution) {
  font-size: 10px;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.user-location-marker) {
  background: transparent !important;
  border: none !important;
}
</style>

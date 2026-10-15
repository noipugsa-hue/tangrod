<template>
  <div class="relative w-full h-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
    >
      <div class="text-center px-4">
        <p class="text-red-600 font-semibold mb-2">⚠️ ไม่สามารถโหลดแผนที่ได้</p>
        <p class="text-gray-600 text-sm">{{ error }}</p>
      </div>
    </div>

    <!-- Map Mode Controls -->
    <div
      v-if="showModeControls && !loading && !error"
      class="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
    >
      <button
        v-for="mode in mapModes"
        :key="mode.value"
        @click="changeMapMode(mode.value)"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors w-full text-left',
          currentMode === mode.value
            ? 'bg-primary-800 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        ]"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- 3D Toggle Button -->
    <div
      v-if="show3DToggle && !loading && !error"
      class="absolute top-4 right-4 z-20"
    >
      <button
        @click="toggle3D"
        :class="[
          'px-4 py-2 rounded-xl shadow-xl font-semibold text-sm transition-all',
          is3DMode
            ? 'bg-primary-800 text-white'
            : 'bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-primary-50'
        ]"
      >
        {{ is3DMode ? '2D' : '3D' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGoogleMapsService } from '~/services/googleMapsService'
import type { Location, FloodArea } from '~/types'
import type { MapMode } from '~/services/googleMapsService'

interface Props {
  center?: Location
  zoom?: number
  floodAreas?: FloodArea[]
  markers?: Array<{ location: Location; label?: string; type?: string }>
  defaultMode?: MapMode
  showModeControls?: boolean
  show3DToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  center: () => ({ lat: 13.7430257, lng: 100.5392123 }), // Demo location
  zoom: 15,
  floodAreas: () => [],
  markers: () => [],
  defaultMode: 'satellite',
  showModeControls: true,
  show3DToggle: true
})

const emit = defineEmits<{
  mapReady: [map: google.maps.Map]
  markerClick: [location: Location]
  modeChange: [mode: MapMode]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const currentMode = ref<MapMode>(props.defaultMode)
const is3DMode = ref(false)

let mapsService: ReturnType<typeof useGoogleMapsService> | null = null
let map: google.maps.Map | null = null

const mapModes = [
  { value: 'standard' as MapMode, label: 'มาตรฐาน' },
  { value: 'satellite' as MapMode, label: 'ดาวเทียม' },
  { value: 'hybrid' as MapMode, label: 'ผสม' },
  { value: 'terrain' as MapMode, label: 'ภูมิประเทศ' }
]

onMounted(async () => {
  if (!process.client || !mapContainer.value) return

  try {
    loading.value = true
    error.value = null

    // Initialize Google Maps service
    mapsService = useGoogleMapsService()

    // Initialize map
    map = await mapsService.initMap(mapContainer.value, {
      center: props.center,
      zoom: props.zoom,
      mode: props.defaultMode,
      is3D: false
    })

    // Add flood areas
    if (props.floodAreas.length > 0) {
      props.floodAreas.forEach(area => {
        mapsService?.addFloodOverlay({
          id: area.id,
          location: area.location,
          radius: area.radius,
          severity: area.severity,
          waterLevel: area.waterLevel,
          verified: area.verified
        })
      })
    }

    // Add markers
    if (props.markers.length > 0) {
      props.markers.forEach(marker => {
        mapsService?.addMarker(marker.location, {
          title: marker.label,
          content: marker.label ? `<div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">${marker.label}</div>` : undefined
        })
      })
    }

    loading.value = false
    emit('mapReady', map)
  } catch (err) {
    console.error('Failed to initialize map:', err)
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดแผนที่ได้'
    loading.value = false
  }
})

const changeMapMode = (mode: MapMode) => {
  if (!mapsService) return

  currentMode.value = mode
  mapsService.setMapMode(mode)
  emit('modeChange', mode)
}

const toggle3D = () => {
  if (!mapsService) return

  is3DMode.value = !is3DMode.value

  if (is3DMode.value) {
    mapsService.enable3D(45, 0)
  } else {
    mapsService.disable3D()
  }
}

// Expose methods
const setCenter = (location: Location, zoom?: number) => {
  mapsService?.setCenter(location, zoom)
}

const zoomIn = () => {
  mapsService?.zoomIn()
}

const zoomOut = () => {
  mapsService?.zoomOut()
}

const getMap = () => {
  return map
}

defineExpose({
  setCenter,
  zoomIn,
  zoomOut,
  getMap,
  changeMapMode,
  toggle3D
})

// Watch for changes
watch(() => props.floodAreas, (newAreas) => {
  if (!mapsService) return

  // Skip if map is not initialized yet
  try {
    // Clear existing overlays
    mapsService.clearOverlays()

    // Add new overlays
    newAreas.forEach(area => {
      mapsService?.addFloodOverlay({
        id: area.id,
        location: area.location,
        radius: area.radius,
        severity: area.severity,
        waterLevel: area.waterLevel,
        verified: area.verified
      })
    })
  } catch (error) {
    // Map not initialized yet, will be added when map is ready
    console.debug('[GoogleMap] Map not ready yet, flood areas will be added after initialization')
  }
}, { deep: true })

watch(() => props.markers, (newMarkers) => {
  if (!mapsService) return

  // Clear existing markers
  mapsService.clearMarkers()

  // Add new markers
  newMarkers.forEach(marker => {
    mapsService?.addMarker(marker.location, {
      title: marker.label,
      content: marker.label ? `<div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">${marker.label}</div>` : undefined
    })
  })
}, { deep: true })

onBeforeUnmount(() => {
  // Cleanup
  if (mapsService) {
    mapsService.clearMarkers()
    mapsService.clearOverlays()
  }
})
</script>

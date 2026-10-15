<template>
  <div class="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
    <!-- Top Header -->
    <LayoutTopHeader
      :notification-count="0"
      @menu-click="handleMenuClick"
      @notification-click="handleNotificationClick"
    />

    <!-- Weather Card - Compact -->
    <div class="fixed top-20 left-4 right-4 z-30 pointer-events-none">
      <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 pointer-events-auto transition-colors">
        <div class="flex items-center justify-between">
          <!-- Left: Province & Weather -->
          <div class="flex items-center flex-1 min-w-0">
            <div class="mr-2 flex-shrink-0">
              <CloudIcon class="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <div class="flex-1 min-w-0">
              <UiProvinceSelector v-model="selectedProvince" />
            </div>
            <ChevronRightIcon class="w-4 h-4 text-gray-400 dark:text-gray-500 ml-1 flex-shrink-0" />
          </div>

          <!-- Right: Temperature & Radar Button -->
          <div class="flex items-center gap-2 ml-3">
            <div class="text-right flex-shrink-0">
              <div v-if="currentWeather" class="leading-none">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ currentWeather.temperature }}°C</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ currentWeather.description }}</div>
              </div>
              <div v-else class="text-xl text-gray-400 dark:text-gray-500">--°C</div>
            </div>

            <!-- Radar Button -->
            <button
              @click="navigateToRadar"
              class="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex-shrink-0"
              title="ดูภาพเรดาร์ฝน"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Stats Row - Compact -->
        <div class="flex items-center gap-3 mt-2 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs">⚠</span>
            </div>
            <span class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ criticalCount }} จุดน้ำท่วม</span>
          </div>

          <div class="flex items-center gap-1">
            <div class="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs">!</span>
            </div>
            <span class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ warningCount }} จุดเฝ้าระวัง</span>
          </div>

          <div class="flex items-center gap-1">
            <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-xs">💧</span>
            </div>
            <span class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">ฝน {{ monitorCount }} พื้นที่</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Google Map -->
    <MapGoogleMap
      v-if="mounted"
      ref="mapComponentRef"
      :center="mapCenter"
      :zoom="mapZoom"
      :flood-areas="floodAreas"
      :markers="markers"
      :default-mode="'satellite'"
      :show-mode-controls="false"
      :show3-d-toggle="false"
      class="w-full h-full"
      @map-ready="onMapReady"
    />
    <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
        <p class="text-gray-600">กำลังโหลดแผนที่...</p>
      </div>
    </div>

    <!-- Map Controls - Right Side (Redesigned) -->
    <div class="fixed right-4 top-72 z-30 space-y-3">
      <!-- Layers Button -->
      <button
        @click="toggleLayers"
        :class="[
          'w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center transition-all',
          showLayers ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
        ]"
      >
        <Squares2X2Icon class="w-6 h-6" />
      </button>

      <!-- Center on User/GPS Button -->
      <button
        @click="centerOnUser"
        class="w-12 h-12 bg-white rounded-xl shadow-lg text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" stroke-width="2"/>
          <circle cx="12" cy="12" r="8" stroke-width="2" stroke-dasharray="2 2"/>
        </svg>
      </button>

      <!-- Zoom Controls -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          @click="zoomIn"
          class="w-12 h-12 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center border-b border-gray-100"
        >
          <PlusIcon class="w-6 h-6 font-bold" />
        </button>
        <button
          @click="zoomOut"
          class="w-12 h-12 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <MinusIcon class="w-6 h-6 font-bold" />
        </button>
      </div>
    </div>

    <!-- Legend - Bottom Left (Redesigned) -->
    <div class="fixed left-4 bottom-24 z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          <span class="text-xs font-medium text-gray-700">ปลอดภัย</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-yellow-400 rounded-full flex-shrink-0"></div>
          <span class="text-xs font-medium text-gray-700">เฝ้าระวัง</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
          <span class="text-xs font-medium text-gray-700">เสี่ยง</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-red-600 rounded-full flex-shrink-0"></div>
          <span class="text-xs font-medium text-gray-700">น้ำท่วม</span>
        </div>
      </div>
    </div>

    <!-- FAB - Route Planning (Redesigned) -->
    <button
      @click="navigateToRoute"
      class="fixed right-4 bottom-24 z-30 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-blue-500/50 active:scale-95 transition-all group"
    >
      <div class="flex flex-col items-center">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span class="text-[9px] font-bold mt-0.5 leading-none">วางแผน<br/>เส้นทาง</span>
      </div>
    </button>

    <!-- Layers Panel -->
    <Transition name="slide-up">
      <div v-if="showLayers" class="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl pb-24">
        <!-- Handle Bar -->
        <div class="pt-3 pb-2 flex justify-center">
          <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div class="px-6 pb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">เลเยอร์แผนที่</h3>
            <button
              @click="showLayers = false"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div class="space-y-2">
            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <span class="font-medium text-gray-900">พื้นที่น้ำท่วม</span>
              <input v-model="layers.flood" type="checkbox" class="w-5 h-5 text-primary-600 rounded" />
            </label>

            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <span class="font-medium text-gray-900">จุดเสี่ยง</span>
              <input v-model="layers.risk" type="checkbox" class="w-5 h-5 text-primary-600 rounded" />
            </label>

            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <span class="font-medium text-gray-900">โรงพยาบาล</span>
              <input v-model="layers.hospital" type="checkbox" class="w-5 h-5 text-primary-600 rounded" />
            </label>

            <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <span class="font-medium text-gray-900">ศูนย์พักพิง</span>
              <input v-model="layers.shelter" type="checkbox" class="w-5 h-5 text-primary-600 rounded" />
            </label>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Data Attribution - Hidden by default, can be shown in menu -->
    <!-- Removed to match design -->

    <!-- Loading Overlay -->
    <div v-if="loadingFloodData" class="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p class="text-lg font-semibold text-gray-900">กำลังโหลดข้อมูลน้ำท่วม</p>
        <p class="text-sm text-gray-600">จาก GISTDA</p>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="floodDataError && !loadingFloodData" class="absolute top-20 left-4 right-4 z-30 bg-red-50 border-2 border-red-200 rounded-xl p-4">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <h3 class="font-semibold text-red-900 mb-1">เกิดข้อผิดพลาด</h3>
          <p class="text-sm text-red-800">{{ floodDataError }}</p>
          <button @click="loadFloodData" class="mt-2 text-sm font-medium text-red-600 hover:text-red-800">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CloudIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  Squares2X2Icon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useLocationStore } from '~/stores/location'
import { useRiskStore } from '~/stores/risk'
import { usePlacesService } from '~/services/placesService'
import { useGISTDAService } from '~/services/gistdaService'
import { provinces, getProvinceById } from '~/utils/provinces'
import type { Location, WeatherData, FloodArea, FloodDataMetadata } from '~/types'
import type { MapMode } from '~/services/googleMapsService'
import type { PlaceResult } from '~/services/placesService'

const locationStore = useLocationStore()
const riskStore = useRiskStore()
const weatherService = useWeatherService()
const placesService = usePlacesService()
const gistdaService = useGISTDAService()
const router = useRouter()

const mounted = ref(false)
// Default to Samut Songkhram (matching home page)
const mapCenter = ref<Location>({ lat: 13.4097, lng: 100.0024 }) // Samut Songkhram
const mapZoom = ref(12)
const selectedProvince = ref('samut-songkhram') // Pre-select Samut Songkhram
const selectedProvinceLocation = ref<Location | null>({ lat: 13.4097, lng: 100.0024 })
const showLayers = ref(false)
const currentWeather = ref<WeatherData | null>(null)
const loadingWeather = ref(false)

// GISTDA flood data state
const floodAreas = ref<FloodArea[]>([])
const loadingFloodData = ref(false)
const floodDataError = ref<string | null>(null)
const floodMetadata = ref<FloodDataMetadata | null>(null)

// Province data is now imported from utils/provinces.ts

const layers = ref({
  flood: true,
  risk: true,
  hospital: true,
  shelter: true
})

const mapComponentRef = ref<any>(null)
let mapInstance: any = null

// Emergency places state
const emergencyPlaces = ref<{
  hospitals: PlaceResult[]
  police: PlaceResult[]
  shelters: PlaceResult[]
  fireStations: PlaceResult[]
}>({
  hospitals: [],
  police: [],
  shelters: [],
  fireStations: []
})

const emergencyMarkers = ref<{
  hospitals: google.maps.Marker[]
  police: google.maps.Marker[]
  shelters: google.maps.Marker[]
  fireStations: google.maps.Marker[]
}>({
  hospitals: [],
  police: [],
  shelters: [],
  fireStations: []
})

const loadingEmergencyPlaces = ref(false)

/**
 * Load real flood data from GISTDA API with fallback to mock data
 */
const loadFloodData = async () => {
  loadingFloodData.value = true
  floodDataError.value = null

  try {
    console.log('[Map] Fetching GISTDA flood data...')
    const response = await gistdaService.getFloodData()
    const areas = gistdaService.convertToFloodAreas(response)

    floodAreas.value = areas
    floodMetadata.value = {
      lastUpdated: new Date(),
      source: 'GISTDA',
      itemCount: areas.length,
      coverage: 'ทั่วประเทศไทย'
    }

    // Update risk store with GISTDA data
    riskStore.setFloodAreas(areas)

    console.log(`[Map] Loaded ${areas.length} flood areas from GISTDA`)
  } catch (error) {
    console.error('[Map] Failed to load GISTDA flood data, using mock data:', error)

    // Fallback to mock data from seedData
    const { seedFloodAreas } = await import('~/utils/seedData')
    floodAreas.value = seedFloodAreas
    floodMetadata.value = {
      lastUpdated: new Date(),
      source: 'ข้อมูลตัวอย่าง (Demo)',
      itemCount: seedFloodAreas.length,
      coverage: 'พื้นที่ตัวอย่าง'
    }

    // Update risk store with mock data
    riskStore.setFloodAreas(seedFloodAreas)

    console.log(`[Map] Loaded ${seedFloodAreas.length} flood areas from mock data`)

    // Clear error since we have fallback data
    floodDataError.value = null
  } finally {
    loadingFloodData.value = false
  }
}

// Markers for current location and selected province
const markers = computed(() => {
  const m: Array<{ location: Location; label?: string; type?: string }> = []

  if (locationStore.currentLocation) {
    m.push({
      location: locationStore.currentLocation,
      label: 'ตำแหน่งของคุณ',
      type: 'user'
    })
    console.log('📌 Added user location marker:', locationStore.currentLocation)
  }

  // Add marker for selected province
  if (selectedProvinceLocation.value) {
    const province = getProvinceById(selectedProvince.value)
    const provinceName = province?.name || selectedProvince.value
    m.push({
      location: selectedProvinceLocation.value,
      label: provinceName,
      type: 'province'
    })
    console.log('📌 Added province marker:', provinceName, selectedProvinceLocation.value)
  }

  console.log('📌 Total markers:', m.length, m)
  return m
})

// Stats
const criticalCount = computed(() =>
  floodAreas.value.filter(a => a.severity === 'SEVERE' || a.severity === 'CRITICAL').length
)
const warningCount = computed(() =>
  floodAreas.value.filter(a => a.severity === 'MODERATE').length
)
const monitorCount = computed(() =>
  floodAreas.value.filter(a => a.severity === 'MINOR').length
)

const onMapReady = async (map: any) => {
  mapInstance = map

  // Temporarily disabled - enable Places API in Google Cloud Console first
  // const location = locationStore.currentLocation || mapCenter.value
  // await loadEmergencyPlaces(location)
}

const loadEmergencyPlaces = async (location: Location) => {
  if (!mapInstance || loadingEmergencyPlaces.value) return

  loadingEmergencyPlaces.value = true

  try {
    const radius = 5000 // 5km radius

    // Search for different types of emergency places in parallel
    const [hospitals, police, shelters, fireStations] = await Promise.all([
      placesService.searchHospitals(mapInstance, location, radius),
      placesService.searchPoliceStations(mapInstance, location, radius),
      placesService.searchNearbyPlaces(mapInstance, {
        location,
        radius,
        type: 'shelter'
      }),
      placesService.searchFireStations(mapInstance, location, radius)
    ])

    emergencyPlaces.value = {
      hospitals: hospitals.slice(0, 10), // Limit to 10 each
      police: police.slice(0, 10),
      shelters: shelters.slice(0, 10),
      fireStations: fireStations.slice(0, 10)
    }

    // Add markers based on current layer settings
    updateEmergencyMarkers()
  } catch (error) {
    console.error('Error loading emergency places:', error)
  } finally {
    loadingEmergencyPlaces.value = false
  }
}

const updateEmergencyMarkers = () => {
  if (!mapInstance) return

  // Clear existing markers
  Object.values(emergencyMarkers.value).forEach(markers => {
    markers.forEach(marker => marker.setMap(null))
  })

  // Add hospital markers if layer is enabled
  if (layers.value.hospital && emergencyPlaces.value.hospitals.length > 0) {
    emergencyMarkers.value.hospitals = emergencyPlaces.value.hospitals.map(place => {
      const marker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: place.location.lat, lng: place.location.lng },
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">🏥 ${place.name}</h3>
            <p style="font-size: 14px; margin: 4px 0;">${place.address}</p>
            <p style="font-size: 14px; margin: 4px 0;">ระยะทาง: ${(place.distance / 1000).toFixed(2)} กม.</p>
            ${place.openNow !== undefined ? `<p style="font-size: 14px; margin: 4px 0;">${place.openNow ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      return marker
    })
  }

  // Add police markers if hospital layer is enabled (grouped with emergency services)
  if (layers.value.hospital && emergencyPlaces.value.police.length > 0) {
    emergencyMarkers.value.police = emergencyPlaces.value.police.map(place => {
      const marker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: place.location.lat, lng: place.location.lng },
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">🚓 ${place.name}</h3>
            <p style="font-size: 14px; margin: 4px 0;">${place.address}</p>
            <p style="font-size: 14px; margin: 4px 0;">ระยะทาง: ${(place.distance / 1000).toFixed(2)} กม.</p>
            ${place.openNow !== undefined ? `<p style="font-size: 14px; margin: 4px 0;">${place.openNow ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      return marker
    })
  }

  // Add shelter markers if layer is enabled
  if (layers.value.shelter && emergencyPlaces.value.shelters.length > 0) {
    emergencyMarkers.value.shelters = emergencyPlaces.value.shelters.map(place => {
      const marker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: place.location.lat, lng: place.location.lng },
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">🏠 ${place.name}</h3>
            <p style="font-size: 14px; margin: 4px 0;">${place.address}</p>
            <p style="font-size: 14px; margin: 4px 0;">ระยะทาง: ${(place.distance / 1000).toFixed(2)} กม.</p>
            ${place.openNow !== undefined ? `<p style="font-size: 14px; margin: 4px 0;">${place.openNow ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      return marker
    })
  }

  // Add fire station markers if hospital layer is enabled (grouped with emergency services)
  if (layers.value.hospital && emergencyPlaces.value.fireStations.length > 0) {
    emergencyMarkers.value.fireStations = emergencyPlaces.value.fireStations.map(place => {
      const marker = new google.maps.Marker({
        map: mapInstance,
        position: { lat: place.location.lat, lng: place.location.lng },
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#F97316',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: 'Noto Sans Thai', sans-serif;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">🚒 ${place.name}</h3>
            <p style="font-size: 14px; margin: 4px 0;">${place.address}</p>
            <p style="font-size: 14px; margin: 4px 0;">ระยะทาง: ${(place.distance / 1000).toFixed(2)} กม.</p>
            ${place.openNow !== undefined ? `<p style="font-size: 14px; margin: 4px 0;">${place.openNow ? '🟢 เปิดอยู่' : '🔴 ปิดแล้ว'}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker)
      })

      return marker
    })
  }
}

const fetchWeather = async (location: Location) => {
  loadingWeather.value = true
  try {
    const weather = await weatherService.getCurrentWeather(location)
    currentWeather.value = weather
  } catch (error) {
    console.error('Error fetching weather:', error)
  } finally {
    loadingWeather.value = false
  }
}

const centerOnUser = async () => {
  const location = await locationStore.getCurrentLocation()
  if (location) {
    mapCenter.value = location
    mapZoom.value = 16

    // Use Google Maps panTo with smooth animation
    if (mapComponentRef?.value) {
      mapComponentRef.value.setCenter(location, 16)
    }

    // Fetch weather for new location
    await fetchWeather(location)

    // Temporarily disabled - enable Places API in Google Cloud Console first
    // await loadEmergencyPlaces(location)
  }
}

const zoomIn = () => {
  if (mapComponentRef?.value) {
    mapComponentRef.value.zoomIn()
  }
}

const zoomOut = () => {
  if (mapComponentRef?.value) {
    mapComponentRef.value.zoomOut()
  }
}

const toggleLayers = () => {
  showLayers.value = !showLayers.value
}

const navigateToRoute = () => {
  router.push('/route')
}

const navigateToRadar = () => {
  router.push('/radar')
}

const handleMenuClick = () => {
  // TODO: Implement menu drawer/sidebar
  console.log('Menu clicked')
}

const handleNotificationClick = () => {
  // Navigate to notifications page
  router.push('/notifications')
}

/**
 * Format timestamp for data attribution
 */
const formatTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'เมื่อสักครู่'
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} วันที่แล้ว`
}

// Watch for layer changes to update emergency markers
watch(
  () => layers.value,
  () => {
    updateEmergencyMarkers()
  },
  { deep: true }
)

// Watch for province selection changes
watch(selectedProvince, async (newProvince) => {
  console.log('🗺️ Province changed:', newProvince)

  if (!newProvince) {
    selectedProvinceLocation.value = null
    return
  }

  const province = getProvinceById(newProvince)
  if (!province) {
    console.warn(`❌ Province location not found: ${newProvince}`)
    return
  }

  console.log('✅ Province data found:', province)

  // Update selected province location
  selectedProvinceLocation.value = province.location
  console.log('📍 Selected province location updated:', selectedProvinceLocation.value)

  // Pan map to province location
  mapCenter.value = province.location
  mapZoom.value = 12

  console.log('🎯 Map center set to:', mapCenter.value)

  if (mapComponentRef?.value) {
    console.log('🗺️ Calling setCenter on map component')
    mapComponentRef.value.setCenter(province.location, 12)
  } else {
    console.warn('⚠️ Map component ref not available')
  }

  // Fetch weather for province
  console.log('🌤️ Fetching weather for province')
  await fetchWeather(province.location)
})

onMounted(async () => {
  mounted.value = true

  // Clear any old location data from store
  locationStore.clearLocation()

  // Load real GISTDA flood data
  await loadFloodData()

  // Always start with Samut Songkhram as default
  // User can click "Center on User" button to use GPS location
  await fetchWeather(mapCenter.value)
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Smooth map interactions */
:deep(.leaflet-container) {
  cursor: grab;
}

:deep(.leaflet-container:active) {
  cursor: grabbing;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

:deep(.leaflet-popup-tip) {
  display: none;
}
</style>

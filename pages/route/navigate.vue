<template>
  <div class="fixed inset-0 bg-gray-900">
    <!-- Map -->
    <ClientOnly>
      <MapGoogleMap
        v-if="mounted"
        ref="mapComponentRef"
        :center="currentLocation || mapCenter"
        :zoom="17"
        :flood-areas="nearbyFloodAreas"
        :markers="navigationMarkers"
        :default-mode="'hybrid'"
        :show-mode-controls="false"
        :show3-d-toggle="false"
        class="w-full h-full"
        @map-ready="onMapReady"
      />
      <template #fallback>
        <div class="w-full h-full flex items-center justify-center bg-gray-900">
          <div class="text-center text-white">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>กำลังโหลดแผนที่...</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Top Bar - Navigation Info -->
    <div class="absolute top-0 left-0 right-0 z-20">
      <!-- Header -->
      <div class="bg-gray-900/95 backdrop-blur-md text-white p-4 shadow-2xl">
        <div class="flex items-center justify-between mb-3">
          <button @click="exitNavigation" class="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
          <div class="text-center flex-1">
            <div class="text-xs text-gray-400">ถึงปลายทางใน</div>
            <div class="text-2xl font-bold">{{ remainingTime }}</div>
          </div>
          <button @click="showRouteInfo = !showRouteInfo" class="p-2 hover:bg-white/10 rounded-full transition-colors">
            <InformationCircleIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Current Instruction -->
        <div class="bg-white/10 rounded-2xl p-4">
          <div class="flex items-start">
            <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
              <component :is="currentInstruction.icon" class="w-10 h-10 text-white" />
            </div>
            <div class="flex-1">
              <div class="text-sm text-gray-300 mb-1">{{ currentInstruction.distance }}</div>
              <div class="text-lg font-semibold">{{ currentInstruction.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning Alert -->
      <Transition name="slide-down">
        <div v-if="nearbyWarning" class="mx-4 mt-4">
          <div :class="`bg-${nearbyWarning.color}-500 text-white rounded-2xl p-4 shadow-2xl`">
            <div class="flex items-start">
              <ExclamationTriangleIcon class="w-6 h-6 mr-3 flex-shrink-0" />
              <div class="flex-1">
                <div class="font-semibold mb-1">{{ nearbyWarning.title }}</div>
                <div class="text-sm opacity-90">{{ nearbyWarning.message }}</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Bottom Panel - Stats -->
    <div class="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8">
      <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-4">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-xs text-gray-600 mb-1">ระยะทางเหลือ</div>
            <div class="text-2xl font-bold text-gray-900">{{ remainingDistance }}</div>
            <div class="text-xs text-gray-500">กิโลเมตร</div>
          </div>
          <div>
            <div class="text-xs text-gray-600 mb-1">ความเร็ว</div>
            <div class="text-2xl font-bold text-primary-800">{{ currentSpeed }}</div>
            <div class="text-xs text-gray-500">กม./ชม.</div>
          </div>
          <div>
            <div class="text-xs text-gray-600 mb-1">เวลาถึง</div>
            <div class="text-2xl font-bold text-gray-900">{{ arrivalTime }}</div>
            <div class="text-xs text-gray-500">น.</div>
          </div>
        </div>

        <!-- Next Steps Preview -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-xs font-semibold text-gray-600 mb-2">ขั้นตอนถัดไป</div>
          <div class="space-y-2">
            <div
              v-for="(step, index) in nextSteps"
              :key="index"
              class="flex items-center text-sm"
            >
              <div class="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-semibold flex items-center justify-center mr-2 text-xs">
                {{ index + 1 }}
              </div>
              <div class="flex-1 text-gray-700">{{ step.text }}</div>
              <div class="text-xs text-gray-500">{{ step.distance }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 space-y-3">
      <!-- Recenter Button -->
      <button
        @click="recenterMap"
        :class="[
          'p-4 rounded-2xl shadow-2xl transition-all',
          isFollowing ? 'bg-primary-800 text-white' : 'bg-white/95 backdrop-blur-sm text-gray-700'
        ]"
      >
        <MapPinIcon class="w-6 h-6" />
      </button>

      <!-- Volume Button -->
      <button
        @click="toggleVoice"
        class="p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-gray-700 transition-all"
      >
        <SpeakerWaveIcon v-if="voiceEnabled" class="w-6 h-6" />
        <SpeakerXMarkIcon v-else class="w-6 h-6" />
      </button>

      <!-- Report Button -->
      <button
        @click="reportIssue"
        class="p-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl text-gray-700 transition-all"
      >
        <ExclamationCircleIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Route Info Modal -->
    <Transition name="slide-up">
      <div v-if="showRouteInfo" class="absolute inset-0 z-30 bg-black/50" @click="showRouteInfo = false">
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-8 max-h-[70vh] overflow-y-auto" @click.stop>
          <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

          <h3 class="text-xl font-bold text-gray-900 mb-4">ข้อมูลเส้นทาง</h3>

          <div class="space-y-4">
            <!-- Route Summary -->
            <div class="card">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm text-gray-600">เส้นทาง</div>
                  <div class="font-semibold text-gray-900">{{ routeName }}</div>
                </div>
                <div :class="`badge badge-${riskColor}`">{{ riskLabel }}</div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div class="text-gray-600">ระยะทางทั้งหมด</div>
                  <div class="font-semibold">{{ totalDistance }} กม.</div>
                </div>
                <div>
                  <div class="text-gray-600">เวลาโดยประมาณ</div>
                  <div class="font-semibold">{{ totalDuration }}</div>
                </div>
              </div>
            </div>

            <!-- All Instructions -->
            <div class="card">
              <h4 class="font-semibold mb-3">ขั้นตอนทั้งหมด ({{ allInstructions.length }})</h4>
              <div class="space-y-3">
                <div
                  v-for="(instruction, index) in allInstructions"
                  :key="index"
                  :class="[
                    'flex items-start p-3 rounded-lg transition-colors',
                    index === currentStepIndex ? 'bg-primary-50 border-2 border-primary-800' : 'bg-gray-50'
                  ]"
                >
                  <div class="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-semibold flex items-center justify-center mr-3 text-sm flex-shrink-0">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-gray-900 text-sm">{{ instruction.text }}</div>
                    <div class="text-xs text-gray-600 mt-1">{{ instruction.distance }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  MapPinIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import { useLocationStore } from '~/stores/location'
import { useRiskStore } from '~/stores/risk'
import { seedFloodAreas } from '~/utils/seedData'
import type { Location } from '~/types'

const router = useRouter()
const route = useRoute()
const locationStore = useLocationStore()
const riskStore = useRiskStore()

const mounted = ref(false)
const isFollowing = ref(true)
const voiceEnabled = ref(true)
const showRouteInfo = ref(false)
const currentStepIndex = ref(0)
const mapComponentRef = ref<any>(null)
let mapInstance: google.maps.Map | null = null

// Route data from query
const routeName = route.query.route as string || 'เส้นทางหลัก'
const fromLocation = route.query.from as string || 'กรุงเทพมหานคร'
const toLocation = route.query.to as string || 'อัมพวา'

// Navigation state
const currentLocation = ref<Location | null>(null)
const mapCenter = ref<Location>({ lat: 13.7563, lng: 100.5018 })
const currentSpeed = ref(0)
const remainingDistance = ref('68.5')
const remainingTime = ref('1:15:30')
const arrivalTime = ref('14:45')
const totalDistance = ref('71')
const totalDuration = ref('1 ชม. 20 นาที')
const riskColor = ref('success')
const riskLabel = ref('ปลอดภัย')

// Flood areas
const floodAreas = ref(seedFloodAreas)
const nearbyFloodAreas = computed(() => {
  // In production, filter based on current location
  return floodAreas.value.slice(0, 3)
})

// Navigation markers
const navigationMarkers = computed(() => {
  const markers: Array<{ location: Location; label?: string; type?: string }> = []

  if (currentLocation.value) {
    markers.push({
      location: currentLocation.value,
      label: 'ตำแหน่งปัจจุบัน',
      type: 'user'
    })
  }

  // Destination
  markers.push({
    location: { lat: 13.4563, lng: 99.9518 },
    label: toLocation,
    type: 'destination'
  })

  return markers
})

// Navigation instructions
const allInstructions = ref([
  {
    icon: ArrowUpIcon,
    text: 'เริ่มต้นที่ ' + fromLocation,
    distance: '0 ม.'
  },
  {
    icon: ArrowRightIcon,
    text: 'เลี้ยวขวาไปทางหลวง 35 (ถนนพระราม 2)',
    distance: '200 ม.'
  },
  {
    icon: ArrowUpIcon,
    text: 'ตรงไปตามทางหลวง 35',
    distance: '25 กม.'
  },
  {
    icon: ExclamationTriangleIcon,
    text: 'ผ่านวัดบางสีราช (ระวังน้ำท่วม 10-20 ซม.)',
    distance: '40 กม.'
  },
  {
    icon: ArrowUpIcon,
    text: 'ตรงไปยังสี่แยกบางเพ',
    distance: '55 กม.'
  },
  {
    icon: ArrowLeftIcon,
    text: 'เลี้ยวซ้ายเข้าตัวเมืองอัมพวา',
    distance: '68 กม.'
  },
  {
    icon: ArrowRightIcon,
    text: 'ถึงปลายทาง ' + toLocation,
    distance: '71 กม.'
  }
])

const currentInstruction = computed(() => {
  return allInstructions.value[currentStepIndex.value]
})

const nextSteps = computed(() => {
  return allInstructions.value.slice(currentStepIndex.value + 1, currentStepIndex.value + 4)
})

// Warnings
const nearbyWarning = ref<{ color: string; title: string; message: string } | null>({
  color: 'warning',
  title: 'พื้นที่น้ำท่วมข้างหน้า',
  message: 'อีก 5 กม. พบน้ำท่วมบริเวณวัดบางสีราช (น้ำสูง 10-20 ซม.) ขับขี่ด้วยความระมัดระวัง'
})

// Location tracking
let locationWatchId: number | null = null

const startLocationTracking = () => {
  if ('geolocation' in navigator) {
    locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        currentLocation.value = newLocation

        // Update speed
        if (position.coords.speed !== null) {
          currentSpeed.value = Math.round((position.coords.speed * 3.6)) // m/s to km/h
        }

        // Auto-center if following
        if (isFollowing.value && mapInstance) {
          mapInstance.panTo({ lat: newLocation.lat, lng: newLocation.lng })
        }

        // Simulate progress
        simulateProgress()
      },
      (error) => {
        console.error('Location tracking error:', error)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    )
  }
}

const stopLocationTracking = () => {
  if (locationWatchId !== null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(locationWatchId)
    locationWatchId = null
  }
}

// Simulate progress for demo
let progressInterval: NodeJS.Timeout | null = null

const simulateProgress = () => {
  // In production, calculate based on actual GPS location
  const distance = parseFloat(remainingDistance.value)
  if (distance > 0) {
    remainingDistance.value = (distance - 0.1).toFixed(1)
  }

  // Update step if needed
  if (distance < 60 && currentStepIndex.value === 1) {
    currentStepIndex.value = 2
  } else if (distance < 40 && currentStepIndex.value === 2) {
    currentStepIndex.value = 3
    speakInstruction('ระวัง พื้นที่น้ำท่วมข้างหน้า')
  } else if (distance < 20 && currentStepIndex.value === 3) {
    currentStepIndex.value = 4
  } else if (distance < 10 && currentStepIndex.value === 4) {
    currentStepIndex.value = 5
  } else if (distance < 3 && currentStepIndex.value === 5) {
    currentStepIndex.value = 6
    speakInstruction('กำลังจะถึงปลายทาง')
  }
}

const speakInstruction = (text: string) => {
  if (voiceEnabled.value && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'th-TH'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }
}

const recenterMap = () => {
  isFollowing.value = true
  if (currentLocation.value && mapComponentRef?.value) {
    mapComponentRef.value.setCenter(currentLocation.value, 17)
  }
}

const toggleVoice = () => {
  voiceEnabled.value = !voiceEnabled.value
  if (voiceEnabled.value) {
    speakInstruction('เปิดเสียงแนะนำทางแล้ว')
  }
}

const reportIssue = () => {
  router.push('/report/create')
}

const exitNavigation = () => {
  if (confirm('ต้องการออกจากการนำทางหรือไม่?')) {
    stopLocationTracking()
    if (progressInterval) {
      clearInterval(progressInterval)
    }
    router.push('/route')
  }
}

onMounted(async () => {
  mounted.value = true
  riskStore.setFloodAreas(floodAreas.value)

  // Start location tracking
  startLocationTracking()

  // Get initial location
  currentLocation.value = await locationStore.getCurrentLocation()

  // Simulate progress every 2 seconds
  progressInterval = setInterval(simulateProgress, 2000)

  // Speak first instruction
  setTimeout(() => {
    speakInstruction(currentInstruction.value.text)
  }, 2000)
})

// Add drag listener when map is ready
const onMapReady = (map: google.maps.Map) => {
  mapInstance = map

  // Map gesture handling - stop following when user drags
  if (mapInstance) {
    mapInstance.addListener('dragstart', () => {
      isFollowing.value = false
    })
  }
}

onBeforeUnmount(() => {
  stopLocationTracking()
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
})

definePageMeta({
  layout: false
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .absolute.bottom-0,
.slide-up-leave-to .absolute.bottom-0 {
  transform: translateY(100%);
}
</style>

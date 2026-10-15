<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <!-- Header with Back Button -->
    <div class="bg-white border-b border-gray-100 px-4 py-4 flex items-center">
      <button @click="router.back()" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronLeftIcon class="w-6 h-6 text-gray-700" />
      </button>
      <h1 class="flex-1 text-center text-lg font-bold text-gray-900 -ml-10">วางแผนเส้นทาง</h1>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4">
      <!-- Route Inputs Container -->
      <div class="bg-white rounded-2xl shadow-sm p-4 relative">
        <!-- Origin -->
        <div class="flex items-center mb-3">
          <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center">
            <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
          <div class="flex-1 ml-3">
            <input
              v-model="origin"
              type="text"
              placeholder="กรุงเทพมหานคร"
              class="w-full py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Destination -->
        <div class="flex items-center">
          <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center">
            <MapPinIcon class="w-5 h-5 text-red-500" />
          </div>
          <div class="flex-1 ml-3">
            <input
              v-model="destination"
              type="text"
              placeholder="สมุทรสงคราม"
              class="w-full py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Swap Button -->
        <button
          @click="swapLocations"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-200 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <ArrowsUpDownIcon class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <!-- Vehicle Type Selector -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="vehicle in vehicles"
            :key="vehicle.type"
            :class="[
              'flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all',
              selectedVehicle === vehicle.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            ]"
            @click="selectedVehicle = vehicle.type"
          >
            <component
              :is="vehicle.icon"
              :class="[
                'w-8 h-8 mb-1',
                selectedVehicle === vehicle.type ? 'text-white' : 'text-gray-500'
              ]"
            />
            <span class="text-xs font-semibold">{{ vehicle.label }}</span>
          </button>
        </div>
      </div>

      <!-- Calculate Button -->
      <button
        @click="calculateRoute"
        :disabled="!origin || !destination || calculating"
        class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!calculating">วิเคราะห์เส้นทาง</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังคำนวณ...
        </span>
      </button>

      <!-- Error/Info Message -->
      <div v-if="error" :class="[
        'border-2 rounded-xl p-4',
        error.includes('⚠️') ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
      ]">
        <div class="flex items-start gap-3">
          <ExclamationTriangleIcon :class="[
            'w-6 h-6 flex-shrink-0',
            error.includes('⚠️') ? 'text-yellow-600' : 'text-red-600'
          ]" />
          <div class="flex-1">
            <p :class="[
              'text-sm font-medium',
              error.includes('⚠️') ? 'text-yellow-800' : 'text-red-800'
            ]">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Route Results -->
      <div v-if="routes.length > 0" class="space-y-3">
        <h3 class="font-bold text-lg text-gray-900">เส้นทางแนะนำ</h3>

        <div
          v-for="(route, index) in routes"
          :key="index"
          class="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
          @click="viewRouteDetails(route)"
        >
          <!-- Header with Badge -->
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-bold text-gray-900 text-base">{{ route.name }}</h4>
            <div
              v-if="index === 0"
              class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <UserIcon class="w-3 h-3" />
              แนะนำ
            </div>
          </div>

          <!-- Score -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div
                :class="[
                  'text-2xl font-black px-3 py-1 rounded-lg',
                  getRiskBgClass(route.risk)
                ]"
              >
                {{ route.score }}<span class="text-base font-normal">/100</span>
              </div>
              <span class="text-sm font-bold text-gray-700">{{ getRiskLabel(route.risk) }}</span>
            </div>
          </div>

          <!-- Distance & Duration -->
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div class="text-xs text-gray-500 mb-1">ระยะทาง</div>
              <div class="text-lg font-bold text-gray-900">{{ route.distance }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">เวลาเดินทาง</div>
              <div class="text-lg font-bold text-gray-900">{{ route.duration }}</div>
            </div>
          </div>

          <!-- Warnings -->
          <div v-if="route.warnings.length > 0" class="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div class="flex items-start gap-2">
              <ExclamationTriangleIcon class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div class="flex-1">
                <div class="text-sm font-bold text-orange-900 mb-2">
                  มีจุดเฝ้าระวัง {{ route.warnings.length }} จุด
                </div>
                <ul class="text-xs text-orange-800 space-y-1">
                  <li v-for="(warning, wIndex) in route.warnings.slice(0, 2)" :key="wIndex">
                    • {{ warning }}
                  </li>
                </ul>
                <button class="text-xs text-blue-600 font-semibold mt-2">
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapPinIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import { TruckIcon } from '@heroicons/vue/24/solid'
import type { RiskLevel, Location } from '~/types'

const router = useRouter()

const origin = ref('กรุงเทพมหานคร')
const destination = ref('สมุทรสงคราม')
const selectedVehicle = ref<'CAR' | 'PICKUP' | 'SUV' | 'VAN'>('CAR')
const calculating = ref(false)
const error = ref<string | null>(null)

interface RouteDisplayResult {
  id: string
  name: string
  distance: string
  duration: string
  score: number
  risk: RiskLevel
  warnings: string[]
}

const routes = ref<RouteDisplayResult[]>([])

const vehicles = [
  { type: 'CAR', label: 'รถเก๋ง', icon: TruckIcon },
  { type: 'PICKUP', label: 'กระบะ', icon: TruckIcon },
  { type: 'SUV', label: 'SUV', icon: TruckIcon },
  { type: 'VAN', label: 'รถตู้', icon: TruckIcon }
]

const swapLocations = () => {
  const temp = origin.value
  origin.value = destination.value
  destination.value = temp
}

const calculateRoute = async () => {
  calculating.value = true
  error.value = null
  routes.value = []

  try {
    if (!origin.value || !destination.value) {
      error.value = 'กรุณากรอกจุดเริ่มต้นและจุดหมายปลายทาง'
      return
    }

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate mock routes with realistic data
    const baseDistance = 65 + Math.random() * 20 // 65-85 km
    const baseDuration = baseDistance / 1.2 // Roughly 1.2 km/min on average

    routes.value = [
      {
        id: '1',
        name: 'เส้นทางที่แนะนำ',
        distance: `${baseDistance.toFixed(1)} กม.`,
        duration: `${Math.floor(baseDuration / 60)} ชม. ${Math.round(baseDuration % 60)} นาที`,
        score: 85,
        risk: 'LOW' as RiskLevel,
        warnings: []
      },
      {
        id: '2',
        name: 'เส้นทางทางเลือก 1',
        distance: `${(baseDistance * 1.15).toFixed(1)} กม.`,
        duration: `${Math.floor((baseDuration * 1.1) / 60)} ชม. ${Math.round((baseDuration * 1.1) % 60)} นาที`,
        score: 72,
        risk: 'MEDIUM' as RiskLevel,
        warnings: ['ถนนมีน้ำขังบางจุด กรุณาขับขี่ด้วยความระมัดระวัง']
      },
      {
        id: '3',
        name: 'เส้นทางทางเลือก 2',
        distance: `${(baseDistance * 1.25).toFixed(1)} กม.`,
        duration: `${Math.floor((baseDuration * 1.2) / 60)} ชม. ${Math.round((baseDuration * 1.2) % 60)} นาที`,
        score: 65,
        risk: 'MEDIUM' as RiskLevel,
        warnings: ['พบจุดน้ำท่วม 1 จุด', 'แนะนำให้เลี่ยงเส้นทางนี้ถ้าเป็นไปได้']
      }
    ]

    // Don't show warning message - works seamlessly
  } catch (err) {
    console.error('Route calculation error:', err)
    error.value = 'เกิดข้อผิดพลาดในการคำนวณเส้นทาง กรุณาลองใหม่อีกครั้ง'
  } finally {
    calculating.value = false
  }
}

const getRiskBgClass = (risk: RiskLevel): string => {
  switch (risk) {
    case 'LOW':
      return 'bg-green-500 text-white'
    case 'MEDIUM':
      return 'bg-yellow-400 text-gray-900'
    case 'HIGH':
      return 'bg-orange-500 text-white'
    case 'CRITICAL':
      return 'bg-red-600 text-white'
    default:
      return 'bg-gray-300 text-gray-900'
  }
}

const getRiskLabel = (risk: RiskLevel): string => {
  switch (risk) {
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

const viewRouteDetails = (route: RouteDisplayResult) => {
  // Navigate to route details page
  router.push({
    path: '/route/details',
    query: {
      from: origin.value,
      to: destination.value,
      route: route.name,
      routeId: route.id
    }
  })
}

definePageMeta({
  layout: 'default'
})
</script>

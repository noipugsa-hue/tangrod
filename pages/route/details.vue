<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="p-4 flex items-center">
        <button @click="goBack" class="mr-3">
          <ChevronLeftIcon class="w-6 h-6 text-gray-600" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-gray-900">รายละเอียดเส้นทาง</h1>
          <p class="text-xs text-gray-600">{{ routeName }}</p>
        </div>
      </div>
    </div>

    <!-- Map Preview -->
    <div class="relative h-64 bg-gray-200">
      <ClientOnly>
        <MapGoogleMap
          v-if="mounted"
          :center="mapCenter"
          :zoom="12"
          :flood-areas="floodAreas"
          :markers="routeMarkers"
          :default-mode="'satellite'"
          :show-mode-controls="false"
          :show3-d-toggle="false"
          class="w-full h-full"
        />
        <template #fallback>
          <div class="w-full h-full flex items-center justify-center">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto mb-4"></div>
              <p class="text-gray-600">กำลังโหลดแผนที่...</p>
            </div>
          </div>
        </template>
      </ClientOnly>

      <!-- Map Overlay Stats -->
      <div class="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ distance }}</div>
            <div class="text-xs text-gray-600">กม.</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ duration }}</div>
            <div class="text-xs text-gray-600">นาที</div>
          </div>
          <div>
            <div class="text-2xl font-bold" :class="`text-${riskColor}-600`">{{ riskScore }}</div>
            <div class="text-xs text-gray-600">คะแนน</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4">
      <!-- Risk Summary -->
      <div :class="`card border-2 border-${riskColor}-200 bg-${riskColor}-50`">
        <div class="flex items-start">
          <div :class="`w-12 h-12 rounded-full bg-${riskColor}-500 flex items-center justify-center mr-3`">
            <ShieldCheckIcon v-if="riskLevel === 'LOW'" class="w-6 h-6 text-white" />
            <ExclamationTriangleIcon v-else-if="riskLevel === 'MEDIUM'" class="w-6 h-6 text-white" />
            <ExclamationCircleIcon v-else class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <h3 :class="`font-semibold text-${riskColor}-900 mb-1`">{{ riskLabel }}</h3>
            <p :class="`text-sm text-${riskColor}-700`">{{ riskDescription }}</p>
          </div>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="warnings.length > 0" class="card bg-warning-50 border border-warning-200">
        <div class="flex items-start mb-3">
          <ExclamationTriangleIcon class="w-5 h-5 text-warning-600 mr-2 flex-shrink-0 mt-0.5" />
          <h3 class="font-semibold text-warning-900">จุดเฝ้าระวัง ({{ warnings.length }})</h3>
        </div>
        <div class="space-y-2">
          <div v-for="(warning, index) in warnings" :key="index" class="flex items-start text-sm">
            <div class="w-6 h-6 rounded-full bg-warning-200 text-warning-800 font-semibold flex items-center justify-center mr-2 flex-shrink-0 text-xs">
              {{ index + 1 }}
            </div>
            <div class="flex-1 text-warning-800">{{ warning }}</div>
          </div>
        </div>
      </div>

      <!-- Route Segments -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
          <MapIcon class="w-5 h-5 mr-2" />
          ช่วงเส้นทาง
        </h3>
        <div class="space-y-3">
          <div
            v-for="(segment, index) in routeSegments"
            :key="index"
            class="flex items-start"
          >
            <!-- Timeline -->
            <div class="flex flex-col items-center mr-3">
              <div :class="`w-4 h-4 rounded-full ${index === 0 ? 'bg-primary-800' : index === routeSegments.length - 1 ? 'bg-red-600' : 'bg-gray-400'}`"></div>
              <div v-if="index < routeSegments.length - 1" class="w-0.5 h-12 bg-gray-300 my-1"></div>
            </div>

            <!-- Content -->
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ segment.name }}</div>
              <div class="text-sm text-gray-600">{{ segment.distance }} กม. • {{ segment.duration }} นาที</div>

              <!-- Risk Badge -->
              <div v-if="segment.risk !== 'LOW'" :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-${getSegmentRiskColor(segment.risk)}-100 text-${getSegmentRiskColor(segment.risk)}-700`">
                <ExclamationCircleIcon class="w-3 h-3 mr-1" />
                {{ segment.riskLabel }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alternative Routes -->
      <div class="card">
        <h3 class="font-semibold text-gray-900 mb-3">เส้นทางอื่น</h3>
        <div class="space-y-2">
          <button
            v-for="alt in alternativeRoutes"
            :key="alt.name"
            class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-800 hover:bg-primary-50 transition-all"
            @click="switchRoute(alt)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 text-sm">{{ alt.name }}</div>
                <div class="text-xs text-gray-600">{{ alt.distance }} กม. • {{ alt.duration }}</div>
              </div>
              <ChevronRightIcon class="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      <!-- Start Navigation Button -->
      <button
        @click="startNavigation"
        class="btn btn-primary w-full py-4 text-lg flex items-center justify-center hover:shadow-xl transition-all"
      >
        <ArrowRightIcon class="w-6 h-6 mr-2" />
        เริ่มนำทาง
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  MapIcon,
  ChevronRightIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'
import { useRiskStore } from '~/stores/risk'
import { seedFloodAreas } from '~/utils/seedData'
import type { Location, RiskLevel } from '~/types'

const router = useRouter()
const route = useRoute()
const riskStore = useRiskStore()

const mounted = ref(false)
const floodAreas = ref(seedFloodAreas)

// Get query params
const fromLocation = route.query.from as string || 'กรุงเทพมหานคร'
const toLocation = route.query.to as string || 'อัมพวา'
const routeName = route.query.route as string || 'เส้นทางหลัก'

// Mock route data
const distance = ref(71)
const duration = ref('80')
const riskScore = ref(82)
const riskLevel = ref<RiskLevel>('LOW')

const warnings = ref([
  'ช่วงวัดบางสีราช (น้ำสูง 10-20 ซม.)',
  'คนเนื่องช่วงสองอัมพวา (คนแน่นมาก)'
])

const routeSegments = ref([
  {
    name: fromLocation,
    distance: 0,
    duration: 0,
    risk: 'LOW' as RiskLevel,
    riskLabel: ''
  },
  {
    name: 'ทางหลวง 35 (ถนนพระราม 2)',
    distance: 25,
    duration: 20,
    risk: 'LOW' as RiskLevel,
    riskLabel: 'ปลอดภัย'
  },
  {
    name: 'วัดบางสีราช',
    distance: 15,
    duration: 15,
    risk: 'MEDIUM' as RiskLevel,
    riskLabel: 'น้ำท่วมเล็กน้อย'
  },
  {
    name: 'สี่แยกบางเพ',
    distance: 20,
    duration: 25,
    risk: 'LOW' as RiskLevel,
    riskLabel: 'ปลอดภัย'
  },
  {
    name: toLocation,
    distance: 11,
    duration: 20,
    risk: 'MEDIUM' as RiskLevel,
    riskLabel: 'คนจราจรหนาแน่น'
  }
])

const alternativeRoutes = ref([
  {
    name: 'เส้นทางรอง (ผ่านสมุทรสาคร)',
    distance: 85,
    duration: '105 นาที'
  }
])

// Map markers
const mapCenter = ref<Location>({ lat: 13.5563, lng: 100.0018 }) // Midpoint
const routeMarkers = computed(() => [
  {
    location: { lat: 13.7563, lng: 100.5018 }, // Bangkok
    label: fromLocation,
    type: 'origin'
  },
  {
    location: { lat: 13.4563, lng: 99.9518 }, // Amphawa
    label: toLocation,
    type: 'destination'
  }
])

// Computed
const riskColor = computed(() => {
  switch (riskLevel.value) {
    case 'LOW':
      return 'success'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
    case 'CRITICAL':
      return 'danger'
    default:
      return 'gray'
  }
})

const riskLabel = computed(() => {
  switch (riskLevel.value) {
    case 'LOW':
      return 'เส้นทางปลอดภัย'
    case 'MEDIUM':
      return 'ควรเฝ้าระวัง'
    case 'HIGH':
      return 'ความเสี่ยงสูง'
    case 'CRITICAL':
      return 'อันตรายมาก'
    default:
      return 'ไม่ทราบ'
  }
})

const riskDescription = computed(() => {
  switch (riskLevel.value) {
    case 'LOW':
      return 'สามารถเดินทางได้อย่างปลอดภัย ไม่มีพื้นที่น้ำท่วมในเส้นทาง'
    case 'MEDIUM':
      return 'พบพื้นที่น้ำท่วมเล็กน้อย ควรขับขี่ด้วยความระมัดระวัง'
    case 'HIGH':
      return 'พบพื้นที่น้ำท่วมหลายจุด ไม่แนะนำให้เดินทาง'
    case 'CRITICAL':
      return 'อันตรายมาก! ห้ามเดินทางในเส้นทางนี้'
    default:
      return ''
  }
})

const getSegmentRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'LOW':
      return 'success'
    case 'MEDIUM':
      return 'warning'
    case 'HIGH':
    case 'CRITICAL':
      return 'danger'
    default:
      return 'gray'
  }
}

const goBack = () => {
  router.back()
}

const switchRoute = (alt: any) => {
  // In production, this would recalculate the route
  console.log('Switching to route:', alt.name)
}

const startNavigation = () => {
  // Navigate to navigation page with route params
  router.push({
    path: '/route/navigate',
    query: {
      from: fromLocation,
      to: toLocation,
      route: routeName
    }
  })
}

onMounted(() => {
  mounted.value = true
  riskStore.setFloodAreas(floodAreas.value)
})

definePageMeta({
  layout: 'default'
})
</script>

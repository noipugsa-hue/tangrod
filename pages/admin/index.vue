<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button @click="$router.back()" class="mr-3">
              <ChevronLeftIcon class="w-6 h-6 text-gray-700" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600">{{ authStore.user?.email }}</span>
            <button @click="handleLogout" class="btn btn-outline btn-sm">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <!-- Stats Overview -->
      <div class="grid md:grid-cols-4 gap-4 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">รายงานทั้งหมด</p>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalReports }}</p>
            </div>
            <DocumentTextIcon class="w-12 h-12 text-primary-800 opacity-20" />
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">รอการตรวจสอบ</p>
              <p class="text-3xl font-bold text-warning">{{ stats.pendingReports }}</p>
            </div>
            <ClockIcon class="w-12 h-12 text-warning opacity-20" />
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">พื้นที่น้ำท่วม</p>
              <p class="text-3xl font-bold text-danger">{{ stats.floodAreas }}</p>
            </div>
            <MapPinIcon class="w-12 h-12 text-danger opacity-20" />
          </div>
        </div>
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">จุดปลอดภัย</p>
              <p class="text-3xl font-bold text-success">{{ stats.emergencyPlaces }}</p>
            </div>
            <ShieldCheckIcon class="w-12 h-12 text-success opacity-20" />
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-800 text-primary-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Flood Reports Tab -->
        <div v-if="activeTab === 'reports'" class="p-6">
          <div class="space-y-4">
            <div v-if="floodReports.length === 0" class="text-center py-8 text-gray-500">
              ไม่มีรายงาน
            </div>
            <div
              v-for="report in floodReports"
              :key="report.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span :class="`badge badge-${getSeverityColor(report.severity)}`">
                      {{ getSeverityLabel(report.severity) }}
                    </span>
                    <span v-if="!report.verified" class="badge badge-warning">รอตรวจสอบ</span>
                    <span v-else class="badge badge-success">ตรวจสอบแล้ว</span>
                  </div>
                  <p class="text-sm text-gray-900 mb-1">{{ report.description }}</p>
                  <p class="text-xs text-gray-500">
                    📍 {{ report.address.district }}, {{ report.address.province }}
                  </p>
                  <p class="text-xs text-gray-500">
                    💧 ระดับน้ำ: {{ report.waterLevel }} ซม. |
                    🚗 {{ report.roadPassable ? 'ผ่านได้' : 'ผ่านไม่ได้' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    รายงานโดย: {{ report.userId }} | {{ formatDate(report.createdAt) }}
                  </p>
                </div>
              </div>

              <!-- Images -->
              <div v-if="report.images && report.images.length > 0" class="grid grid-cols-3 gap-2 mb-3">
                <img
                  v-for="(image, idx) in report.images"
                  :key="idx"
                  :src="image"
                  class="w-full h-24 object-cover rounded-lg"
                  alt="Report image"
                />
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2">
                <button
                  v-if="!report.verified"
                  @click="approveReport(report.id)"
                  :disabled="actionLoading"
                  class="btn btn-success btn-sm"
                >
                  ✓ อนุมัติ
                </button>
                <button
                  @click="deleteReport(report.id)"
                  :disabled="actionLoading"
                  class="btn btn-danger btn-sm"
                >
                  ✕ ลบ
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Flood Areas Tab -->
        <div v-if="activeTab === 'areas'" class="p-6">
          <div class="mb-4">
            <button @click="showAddAreaModal = true" class="btn btn-primary btn-sm">
              + เพิ่มพื้นที่น้ำท่วม
            </button>
          </div>
          <div class="space-y-4">
            <div v-if="floodAreas.length === 0" class="text-center py-8 text-gray-500">
              ไม่มีพื้นที่น้ำท่วม
            </div>
            <div
              v-for="area in floodAreas"
              :key="area.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <span :class="`badge badge-${getSeverityColor(area.severity)} mb-2`">
                    {{ getSeverityLabel(area.severity) }}
                  </span>
                  <p class="text-sm text-gray-900 mb-1">{{ area.description }}</p>
                  <p class="text-xs text-gray-500">
                    📍 Lat: {{ area.location.lat.toFixed(4) }}, Lng: {{ area.location.lng.toFixed(4) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    💧 ระดับน้ำ: {{ area.waterLevel }} ซม. | รัศมี: {{ area.radius }} ม.
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    อัปเดต: {{ formatDate(area.updatedAt) }}
                  </p>
                </div>
                <button
                  @click="deleteFloodArea(area.id)"
                  :disabled="actionLoading"
                  class="btn btn-danger btn-sm"
                >
                  ✕ ลบ
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Places Tab -->
        <div v-if="activeTab === 'places'" class="p-6">
          <div class="mb-4">
            <button @click="showAddPlaceModal = true" class="btn btn-primary btn-sm">
              + เพิ่มจุดปลอดภัย
            </button>
          </div>
          <div class="space-y-4">
            <div v-if="emergencyPlaces.length === 0" class="text-center py-8 text-gray-500">
              ไม่มีจุดปลอดภัย
            </div>
            <div
              v-for="place in emergencyPlaces"
              :key="place.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span :class="`badge badge-${getPlaceTypeColor(place.type)}`">
                      {{ getPlaceTypeLabel(place.type) }}
                    </span>
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1">{{ place.name }}</h3>
                  <p class="text-xs text-gray-500 mb-1">{{ place.address }}</p>
                  <p class="text-xs text-gray-500">
                    📍 Lat: {{ place.location.lat.toFixed(4) }}, Lng: {{ place.location.lng.toFixed(4) }}
                  </p>
                  <p v-if="place.phone" class="text-xs text-gray-500">📞 {{ place.phone }}</p>
                  <p v-if="place.capacity" class="text-xs text-gray-500">
                    👥 รองรับ: {{ place.capacity }} คน
                  </p>
                </div>
                <button
                  @click="deleteEmergencyPlace(place.id)"
                  :disabled="actionLoading"
                  class="btn btn-danger btn-sm"
                >
                  ✕ ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Area Modal -->
    <Transition name="fade">
      <div v-if="showAddAreaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showAddAreaModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <h3 class="text-xl font-bold text-gray-900 mb-4">เพิ่มพื้นที่น้ำท่วม</h3>
          <p class="text-sm text-gray-600 mb-4">ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</p>
          <button @click="showAddAreaModal = false" class="btn btn-primary w-full">
            ปิด
          </button>
        </div>
      </div>
    </Transition>

    <!-- Add Place Modal -->
    <Transition name="fade">
      <div v-if="showAddPlaceModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showAddPlaceModal = false">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" @click.stop>
          <h3 class="text-xl font-bold text-gray-900 mb-4">เพิ่มจุดปลอดภัย</h3>
          <p class="text-sm text-gray-600 mb-4">ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้</p>
          <button @click="showAddPlaceModal = false" class="btn btn-primary w-full">
            ปิด
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  ChevronLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useFirebaseService } from '~/services/firebaseService'
import type { FloodReport, FloodArea, EmergencyPlace, FloodSeverity, EmergencyPlaceType } from '~/types'

const router = useRouter()
const authStore = useAuthStore()
const firebaseService = useFirebaseService()

const loading = ref(true)
const actionLoading = ref(false)
const activeTab = ref('reports')
const showAddAreaModal = ref(false)
const showAddPlaceModal = ref(false)

const floodReports = ref<FloodReport[]>([])
const floodAreas = ref<FloodArea[]>([])
const emergencyPlaces = ref<EmergencyPlace[]>([])

const tabs = [
  { id: 'reports', name: 'รายงานน้ำท่วม' },
  { id: 'areas', name: 'พื้นที่น้ำท่วม' },
  { id: 'places', name: 'จุดปลอดภัย' }
]

const stats = computed(() => ({
  totalReports: floodReports.value.length,
  pendingReports: floodReports.value.filter(r => !r.verified).length,
  floodAreas: floodAreas.value.length,
  emergencyPlaces: emergencyPlaces.value.length
}))

const getSeverityColor = (severity: FloodSeverity): string => {
  const colors = {
    NONE: 'success',
    MINOR: 'info',
    MODERATE: 'warning',
    SEVERE: 'danger',
    CRITICAL: 'danger'
  }
  return colors[severity] || 'gray'
}

const getSeverityLabel = (severity: FloodSeverity): string => {
  const labels = {
    NONE: 'ไม่มีน้ำ',
    MINOR: 'น้ำขัง',
    MODERATE: 'น้ำท่วมปานกลาง',
    SEVERE: 'น้ำท่วมสูง',
    CRITICAL: 'อันตราย'
  }
  return labels[severity] || severity
}

const getPlaceTypeColor = (type: EmergencyPlaceType): string => {
  const colors = {
    HOSPITAL: 'danger',
    SHELTER: 'warning',
    POLICE: 'info',
    FIRE_STATION: 'danger'
  }
  return colors[type] || 'gray'
}

const getPlaceTypeLabel = (type: EmergencyPlaceType): string => {
  const labels = {
    HOSPITAL: 'โรงพยาบาล',
    SHELTER: 'ศูนย์พักพิง',
    POLICE: 'สถานีตำรวจ',
    FIRE_STATION: 'สถานีดับเพลิง'
  }
  return labels[type] || type
}

const formatDate = (date: any): string => {
  if (!date) return 'N/A'

  let d: Date
  if (date.toDate) {
    // Firestore Timestamp
    d = date.toDate()
  } else if (date instanceof Date) {
    d = date
  } else {
    d = new Date(date)
  }

  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [reports, areas, places] = await Promise.all([
      firebaseService.getFloodReports(),
      firebaseService.getFloodAreas(),
      firebaseService.getEmergencyPlaces()
    ])

    floodReports.value = reports
    floodAreas.value = areas
    emergencyPlaces.value = places
  } catch (error) {
    console.error('Error loading data:', error)
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const approveReport = async (reportId: string) => {
  if (!confirm('ยืนยันการอนุมัติรายงานนี้?')) return

  actionLoading.value = true
  try {
    await firebaseService.updateFloodReport(reportId, { verified: true })
    // Refresh data
    await loadData()
  } catch (error) {
    console.error('Error approving report:', error)
    alert('เกิดข้อผิดพลาดในการอนุมัติรายงาน')
  } finally {
    actionLoading.value = false
  }
}

const deleteReport = async (reportId: string) => {
  if (!confirm('ยืนยันการลบรายงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return

  actionLoading.value = true
  try {
    await firebaseService.deleteFloodReport(reportId)
    // Refresh data
    await loadData()
  } catch (error) {
    console.error('Error deleting report:', error)
    alert('เกิดข้อผิดพลาดในการลบรายงาน')
  } finally {
    actionLoading.value = false
  }
}

const deleteFloodArea = async (areaId: string) => {
  if (!confirm('ยืนยันการลบพื้นที่น้ำท่วมนี้?')) return

  actionLoading.value = true
  try {
    await firebaseService.deleteFloodArea(areaId)
    // Refresh data
    await loadData()
  } catch (error) {
    console.error('Error deleting flood area:', error)
    alert('เกิดข้อผิดพลาดในการลบพื้นที่น้ำท่วม')
  } finally {
    actionLoading.value = false
  }
}

const deleteEmergencyPlace = async (placeId: string) => {
  if (!confirm('ยืนยันการลบจุดปลอดภัยนี้?')) return

  actionLoading.value = true
  try {
    await firebaseService.deleteEmergencyPlace(placeId)
    // Refresh data
    await loadData()
  } catch (error) {
    console.error('Error deleting emergency place:', error)
    alert('เกิดข้อผิดพลาดในการลบจุดปลอดภัย')
  } finally {
    actionLoading.value = false
  }
}

const handleLogout = async () => {
  if (confirm('ต้องการออกจากระบบ?')) {
    await authStore.logout()
    router.push('/profile')
  }
}

// Check authentication
onMounted(async () => {
  if (!authStore.user) {
    alert('กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้')
    router.push('/profile')
    return
  }

  await loadData()
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.badge-info {
  @apply bg-blue-100 text-blue-800;
}

.badge-gray {
  @apply bg-gray-100 text-gray-800;
}

.btn-sm {
  @apply px-3 py-1 text-sm;
}

.btn-success {
  @apply bg-success text-white hover:bg-success-600;
}

.btn-info {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.success-600 {
  background-color: #059669;
}
</style>

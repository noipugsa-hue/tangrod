<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <h1 class="text-xl font-bold text-gray-900">รายงานจากผู้ใช้</h1>
    </div>

    <!-- Add Report Button -->
    <div class="p-4">
      <NuxtLink
        to="/report/create"
        class="btn btn-primary w-full flex items-center justify-center"
      >
        <PlusCircleIcon class="w-5 h-5 mr-2" />
        รายงานสถานการณ์
      </NuxtLink>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 pb-4">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedFilter === filter.value
              ? 'bg-primary-800 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Reports List -->
    <div class="px-4 space-y-3">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
        @click="viewReport(report)"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-start flex-1">
            <div :class="`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(report.severity)}`">
              <component :is="getSeverityIcon(report.severity)" class="w-5 h-5 text-white" />
            </div>
            <div class="ml-3 flex-1">
              <div class="font-semibold text-gray-900">{{ getSeverityLabel(report.severity) }}</div>
              <div class="text-sm text-gray-600">{{ report.location }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ report.detail }}</div>
            </div>
          </div>
          <span v-if="report.verified" class="badge badge-success text-xs">ยืนยันแล้ว</span>
        </div>

        <!-- Image -->
        <div v-if="report.image" class="mb-3 rounded-lg overflow-hidden bg-gray-100">
          <div class="aspect-video w-full flex items-center justify-center text-gray-400">
            <PhotoIcon class="w-12 h-12" />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-1 hover:text-primary-800">
              <HandThumbUpIcon class="w-4 h-4" />
              <span>{{ report.likes }}</span>
            </button>
            <span>{{ report.timestamp }}</span>
          </div>
          <button class="text-primary-800 font-medium">ดูรายละเอียด</button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredReports.length === 0" class="text-center py-12">
        <ExclamationCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">ยังไม่มีรายงานในหมวดหมู่นี้</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  HandThumbUpIcon
} from '@heroicons/vue/24/outline'
import { FireIcon, CloudIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

const selectedFilter = ref('all')

const filters = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'น้ำท่วม', value: 'flood' },
  { label: 'คนเนื่อง', value: 'traffic' },
  { label: 'อุบัติเหตุ', value: 'accident' }
]

interface Report {
  id: string
  type: string
  severity: string
  location: string
  detail: string
  image?: boolean
  verified: boolean
  likes: number
  timestamp: string
}

const reports = ref<Report[]>([
  {
    id: '1',
    type: 'flood',
    severity: 'moderate',
    location: 'คนเนื่องช่วงสองอัมพวา (อัมพวา)',
    detail: 'น้ำท่วมสูงประมาณ 20-30 ซม.',
    image: true,
    verified: true,
    likes: 12,
    timestamp: '25 นาทีที่แล้ว'
  },
  {
    id: '2',
    type: 'traffic',
    severity: 'minor',
    location: 'คนเนื่องริม 2 เทงเนื่',
    detail: 'ช่วงวัดบัง ในนเงนหนขฟนคต้าใช้',
    image: true,
    verified: false,
    likes: 8,
    timestamp: '12 นาทีที่แล้ว'
  },
  {
    id: '3',
    type: 'flood',
    severity: 'severe',
    location: 'ต้างด้านเอกปอง',
    detail: 'ฝนตกหนักในพื้นที่ ต้องระมัดระวังเป็นพิเศษ',
    image: true,
    verified: false,
    likes: 6,
    timestamp: '26 นาทีที่แล้ว'
  }
])

const filteredReports = computed(() => {
  if (selectedFilter.value === 'all') {
    return reports.value
  }
  return reports.value.filter(r => r.type === selectedFilter.value)
})

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'severe':
      return FireIcon
    case 'moderate':
      return ExclamationTriangleIcon
    case 'minor':
      return CloudIcon
    default:
      return ExclamationCircleIcon
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'severe':
      return 'bg-red-500'
    case 'moderate':
      return 'bg-warning'
    case 'minor':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'severe':
      return 'น้ำท่วม'
    case 'moderate':
      return 'คนเนื่อง'
    case 'minor':
      return 'ฝนหนัก'
    default:
      return 'อื่นๆ'
  }
}

const viewReport = (report: Report) => {
  router.push(`/report/${report.id}`)
}

definePageMeta({
  layout: 'default'
})
</script>

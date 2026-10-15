<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors">
    <!-- Header -->
    <h3 class="font-semibold text-gray-900 dark:text-white text-lg mb-4">
      แหล่งข้อมูลทางการ
    </h3>

    <!-- Links Grid -->
    <div class="space-y-2">
      <a
        v-for="link in officialLinks"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
          <component
            :is="getCategoryIcon(link.category)"
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ link.name }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400 truncate">
            {{ link.description }}
          </div>
        </div>

        <!-- Arrow -->
        <ArrowTopRightOnSquareIcon class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'
import type { OfficialLink } from '~/types'

// Official links data
const officialLinks: OfficialLink[] = [
  {
    id: '1',
    name: 'สำนักชลประทาน',
    nameEn: 'Royal Irrigation Department',
    description: 'ข้อมูลระดับน้ำและสถานการณ์น้ำ',
    url: 'https://water.rid.go.th/',
    category: 'IRRIGATION',
    order: 1
  },
  {
    id: '2',
    name: 'กรมอุตุนิยมวิทยา',
    nameEn: 'Thai Meteorological Department',
    description: 'พยากรณ์อากาศและคำเตือน',
    url: 'https://www.tmd.go.th/',
    category: 'WEATHER',
    order: 2
  },
  {
    id: '3',
    name: 'กรมป้องกันฯ',
    nameEn: 'Department of Disaster Prevention',
    description: 'สถานการณ์ภัยพิบัติและการเตรียมรับมือ',
    url: 'https://www.disaster.go.th/',
    category: 'DISASTER',
    order: 3
  },
  {
    id: '4',
    name: 'ThaiWater',
    nameEn: 'National Water Command',
    description: 'ศูนย์อำนวยการน้ำแห่งชาติ',
    url: 'https://www.thaiwater.net/',
    category: 'WATER',
    order: 4
  },
  {
    id: '5',
    name: 'สายด่วนภัยพิบัติ 1784',
    nameEn: 'Disaster Hotline',
    description: 'โทรแจ้งเหตุฉุกเฉิน (24 ชม.)',
    url: 'tel:1784',
    category: 'EMERGENCY',
    order: 5
  }
]

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'WATER':
    case 'IRRIGATION':
      return CloudIcon
    case 'WEATHER':
      return CloudIcon
    case 'DISASTER':
      return ExclamationTriangleIcon
    case 'EMERGENCY':
      return PhoneIcon
    default:
      return BuildingOfficeIcon
  }
}
</script>

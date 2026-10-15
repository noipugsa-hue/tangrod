<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Header -->
    <div class="bg-primary-800 text-white p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold">การแจ้งเตือน</h1>
        <button
          v-if="hasUnread"
          @click="markAllAsRead"
          class="text-sm underline hover:text-blue-100"
        >
          อ่านทั้งหมด
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="p-4 space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        @click="markAsRead(notification.id)"
        :class="[
          'bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all',
          !notification.read ? 'border-l-4 border-primary-600' : ''
        ]"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div :class="[
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3',
            getSeverityClass(notification.severity)
          ]">
            <component :is="getSeverityIcon(notification.severity)" class="w-6 h-6 text-white" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <h3 class="font-semibold text-gray-900">{{ notification.title }}</h3>
              <span class="text-xs text-gray-500 ml-2 flex-shrink-0">
                {{ formatTime(notification.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>

            <!-- Location if available -->
            <div v-if="notification.location" class="flex items-center text-xs text-gray-500 mt-2">
              <MapPinIcon class="w-4 h-4 mr-1" />
              {{ formatLocation(notification.location) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="notifications.length === 0" class="text-center py-12">
        <BellIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p class="text-gray-500">ไม่มีการแจ้งเตือน</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'
import type { Notification, Location } from '~/types'

// Mock notifications data
const notifications = ref<Notification[]>([
  {
    id: '1',
    title: 'พบพื้นที่น้ำท่วม',
    message: 'มีรายงานน้ำท่วมในพื้นที่ใกล้คุณ ระยะห่าง 1.2 กม.',
    severity: 'WARNING',
    location: { lat: 13.7563, lng: 100.5018 },
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
  },
  {
    id: '2',
    title: 'ฝนตกหนัก',
    message: 'คาดการณ์ฝนตกหนักในพื้นที่ของคุณในช่วง 2-3 ชั่วโมงข้างหน้า',
    severity: 'INFO',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '3',
    title: 'ถนนปิด',
    message: 'ถนนบางซื่อ-พระราม 4 ปิดการจราจรเนื่องจากน้ำท่วมขัง',
    severity: 'DANGER',
    location: { lat: 13.7563, lng: 100.5018 },
    read: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: '4',
    title: 'สถานการณ์คลี่คลาย',
    message: 'ระดับน้ำในพื้นที่เริ่มลดลง สามารถผ่านได้อย่างระมัดระวัง',
    severity: 'SUCCESS',
    read: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  }
])

const hasUnread = computed(() => notifications.value.some(n => !n.read))

function markAsRead(id: string) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

function markAllAsRead() {
  notifications.value.forEach(n => {
    n.read = true
  })
}

function getSeverityClass(severity: import('~/types').NotificationSeverity): string {
  const classes = {
    INFO: 'bg-blue-500',
    WARNING: 'bg-yellow-500',
    DANGER: 'bg-red-500',
    SUCCESS: 'bg-green-500'
  }
  return classes[severity] || classes.INFO
}

function getSeverityIcon(severity: import('~/types').NotificationSeverity) {
  const icons = {
    INFO: InformationCircleIcon,
    WARNING: ExclamationTriangleIcon,
    DANGER: XCircleIcon,
    SUCCESS: CheckCircleIcon
  }
  return icons[severity] || InformationCircleIcon
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    return `${days} วันที่แล้ว`
  } else if (hours > 0) {
    return `${hours} ชั่วโมงที่แล้ว`
  } else if (minutes > 0) {
    return `${minutes} นาทีที่แล้ว`
  }
  return 'เมื่อสักครู่'
}

function formatLocation(location: Location): string {
  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
}
</script>

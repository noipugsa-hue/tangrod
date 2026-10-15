<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with Background -->
    <div class="bg-gradient-to-br from-primary-800 to-primary-600 text-white p-6 pb-20">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold">โปรไฟล์</h1>
        <button class="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <Cog6ToothIcon class="w-6 h-6" />
        </button>
      </div>

      <div class="flex items-center">
        <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          <UserIcon class="w-12 h-12 text-primary-800" />
        </div>
        <div class="ml-4 flex-1">
          <h2 class="text-xl font-bold">สวัสดีครับ</h2>
          <p class="text-blue-100">ผู้ใช้งานทั่วไป</p>
        </div>
      </div>
    </div>

    <!-- Content Card -->
    <div class="px-4 -mt-12">
      <!-- Saved Locations -->
      <div class="card mb-4">
        <h3 class="font-semibold text-lg mb-3 flex items-center">
          <MapPinIcon class="w-5 h-5 mr-2 text-primary-800" />
          ตั้งค่าที่อยู่โปรด
        </h3>
        <div class="space-y-2">
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center">
              <HomeIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">บ้าน</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center">
              <BuildingOfficeIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">ที่ทำงาน</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center">
              <MapPinIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">อื่นๆ</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card mb-4">
        <h3 class="font-semibold text-lg mb-3 flex items-center">
          <BellIcon class="w-5 h-5 mr-2 text-primary-800" />
          การแจ้งเตือน
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
              <span class="text-gray-700">{{ notificationStatus }}</span>
            </div>
            <button
              v-if="!notificationEnabled"
              @click="enableNotifications"
              :disabled="enablingNotifications"
              class="btn btn-primary btn-sm"
            >
              {{ enablingNotifications ? 'กำลังเปิดใช้งาน...' : 'เปิดใช้งาน' }}
            </button>
            <span v-else class="text-success font-semibold">✓ เปิดใช้งานแล้ว</span>
          </div>
          <p class="text-xs text-gray-500 px-3">
            รับการแจ้งเตือนเมื่อมีน้ำท่วมในพื้นที่ใกล้คุณ
          </p>
        </div>
      </div>

      <!-- Admin Link - Hidden for now -->
      <!-- <div v-if="user" class="card mb-4 bg-primary-50 border-2 border-primary-200">
        <NuxtLink to="/admin" class="flex items-center justify-between p-3">
          <div class="flex items-center">
            <ShieldCheckIcon class="w-5 h-5 text-primary-800 mr-3" />
            <span class="text-primary-800 font-semibold">Admin Dashboard</span>
          </div>
          <ChevronRightIcon class="w-5 h-5 text-primary-600" />
        </NuxtLink>
      </div> -->

      <!-- Menu Items -->
      <div class="card mb-4">
        <div class="space-y-1">
          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex items-center">
              <ClockIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">ประวัติการนัดหมาย</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex items-center">
              <Cog6ToothIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">การตั้งค่า</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex items-center">
              <QuestionMarkCircleIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">ช่วยเหลือ / คำถามที่พบบ่อย</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="flex items-center">
              <InformationCircleIcon class="w-5 h-5 text-gray-600 mr-3" />
              <span class="text-gray-700">เกี่ยวกับเรา</span>
            </div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <!-- Premium Card -->
      <div class="card bg-gradient-to-br from-warning to-warning-600 text-white mb-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-2xl">👑</span>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <h3 class="font-bold text-lg mb-1">สมัครสมาชิกพรีเมียม</h3>
            <p class="text-sm text-white/90 mb-3">ปลดล็อคฟีเจอร์พิเศษและช่วยพัฒนาต่อ</p>
            <button class="bg-white text-warning-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
              เรียนรู้เพิ่มเติม
            </button>
          </div>
        </div>
      </div>

      <!-- Version -->
      <div class="text-center text-sm text-gray-500 py-4">
        <p>ทางรอด (TANGROD)</p>
        <p>เวอร์ชัน 1.0.0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserIcon,
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  BellIcon,
  ClockIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useNotificationService } from '~/services/notificationService'

const authStore = useAuthStore()
const notificationService = useNotificationService()

const user = computed(() => authStore.user)
const notificationEnabled = ref(false)
const enablingNotifications = ref(false)

const notificationStatus = computed(() => {
  if (!notificationService.isNotificationSupported()) {
    return 'เบราว์เซอร์ไม่รองรับการแจ้งเตือน'
  }

  const permission = notificationService.getNotificationPermission()
  if (permission === 'granted') {
    return 'การแจ้งเตือนเปิดใช้งานอยู่'
  } else if (permission === 'denied') {
    return 'การแจ้งเตือนถูกปิดใช้งาน'
  } else {
    return 'เปิดใช้การแจ้งเตือนเพื่อรับข้อมูลล่าสุด'
  }
})

const enableNotifications = async () => {
  enablingNotifications.value = true
  try {
    const success = await notificationService.subscribeToFloodAlerts()
    if (success) {
      notificationEnabled.value = true
      notificationService.setupForegroundListener()
      // Show test notification
      await notificationService.showLocalNotification(
        'ทางรอด',
        'คุณจะได้รับการแจ้งเตือนเมื่อมีน้ำท่วมในพื้นที่ใกล้คุณ'
      )
    } else {
      alert('ไม่สามารถเปิดใช้การแจ้งเตือนได้ กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าเบราว์เซอร์')
    }
  } catch (error) {
    console.error('Error enabling notifications:', error)
    alert('เกิดข้อผิดพลาดในการเปิดใช้การแจ้งเตือน')
  } finally {
    enablingNotifications.value = false
  }
}

const handleLogout = async () => {
  if (confirm('ต้องการออกจากระบบ?')) {
    await authStore.logout()
  }
}

onMounted(() => {
  // Check if notifications are already enabled
  if (process.client) {
    const token = notificationService.getStoredToken()
    if (token && Notification.permission === 'granted') {
      notificationEnabled.value = true
      notificationService.setupForegroundListener()
    }
  }
})

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.btn-sm {
  @apply px-3 py-1.5 text-sm;
}
</style>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20">
    <!-- Top Header -->
    <LayoutTopHeader :notification-count="0" />

    <!-- Spacer for fixed header -->
    <div class="h-20"></div>

    <!-- Page Title -->
    <div class="bg-danger dark:bg-red-900 text-white p-4 transition-colors">
      <h1 class="text-xl font-bold">ฉุกเฉิน</h1>
      <p class="text-sm text-red-100 dark:text-red-200">บริการฉุกเฉินและจุดช่วยเหลือ</p>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-4">
      <!-- Emergency Buttons -->
      <div class="grid grid-cols-2 gap-3">
        <button class="card bg-red-500 text-white hover:bg-red-600 transition-colors p-6 text-center">
          <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-2" />
          <div class="font-semibold">แจ้งเหตุ</div>
        </button>
        <button class="card bg-blue-500 text-white hover:bg-blue-600 transition-colors p-6 text-center">
          <PhoneIcon class="w-12 h-12 mx-auto mb-2" />
          <div class="font-semibold">เบอร์ฉุกเฉิน</div>
        </button>
      </div>

      <!-- Emergency Places -->
      <div class="card dark:bg-gray-800 transition-colors">
        <h3 class="font-semibold text-lg mb-3 dark:text-white">จุดช่วยเหลือใกล้ฉัน</h3>
        <div class="space-y-3">
          <div
            v-for="place in emergencyPlaces"
            :key="place.id"
            class="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          >
            <div :class="`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getPlaceColor(place.type)}`">
              <component :is="getPlaceIcon(place.type)" class="w-6 h-6 text-white" />
            </div>
            <div class="ml-3 flex-1">
              <div class="font-medium text-gray-900 dark:text-white">{{ place.name }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ place.distance }} กม.</div>
              <div v-if="place.hours" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ place.hours }}</div>
            </div>
            <button class="btn btn-primary btn-sm">นำทาง</button>
          </div>
        </div>
      </div>

      <!-- Emergency Numbers -->
      <div class="card dark:bg-gray-800 transition-colors">
        <h3 class="font-semibold text-lg mb-3 dark:text-white">เบอร์โทรฉุกเฉิน</h3>
        <div class="space-y-2">
          <a href="tel:191" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span class="font-medium dark:text-gray-200">ตำรวจ</span>
            <span class="text-primary-800 dark:text-primary-400 font-semibold">191</span>
          </a>
          <a href="tel:1669" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span class="font-medium dark:text-gray-200">กู้ชีพ/กู้ภัย</span>
            <span class="text-primary-800 dark:text-primary-400 font-semibold">1669</span>
          </a>
          <a href="tel:199" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <span class="font-medium dark:text-gray-200">ดับเพลิง</span>
            <span class="text-primary-800 dark:text-primary-400 font-semibold">199</span>
          </a>
        </div>
      </div>

      <!-- Official Links -->
      <OfficialLinks />
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import { BuildingOffice2Icon, HomeIcon, TruckIcon } from '@heroicons/vue/24/solid'

const emergencyPlaces = ref([
  {
    id: '1',
    name: 'โรงพยาบาลจุฬาลงกรณ์',
    type: 'hospital',
    distance: 2.3,
    hours: 'เปิดตลอด 24 ชม.'
  },
  {
    id: '2',
    name: 'ศูนย์พักพิง วัดหัวลำโพง',
    type: 'shelter',
    distance: 1.5,
    hours: 'เปิด 200 คน'
  },
  {
    id: '3',
    name: 'ปั๊ม ปตท.',
    type: 'gas',
    distance: 0.8,
    hours: '08:00-22:00'
  }
])

const getPlaceIcon = (type: string) => {
  switch (type) {
    case 'hospital':
      return BuildingOffice2Icon
    case 'shelter':
      return HomeIcon
    case 'gas':
      return TruckIcon
    default:
      return BuildingOffice2Icon
  }
}

const getPlaceColor = (type: string) => {
  switch (type) {
    case 'hospital':
      return 'bg-red-500'
    case 'shelter':
      return 'bg-success'
    case 'gas':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              ระดับน้ำสถานีวัด
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              อัปเดตทุก 10 นาที
            </p>
          </div>

          <!-- Theme Toggle -->
          <ThemeToggle />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 transition-colors">
          <div class="text-3xl font-bold text-red-600 dark:text-red-400">
            {{ waterStationStore.criticalCount }}
          </div>
          <div class="text-sm text-red-800 dark:text-red-300 mt-1">วิกฤต</div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 transition-colors">
          <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {{ waterStationStore.highRiskCount }}
          </div>
          <div class="text-sm text-orange-800 dark:text-orange-300 mt-1">เสี่ยงสูง</div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 transition-colors">
          <div class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ waterStationStore.watchCount }}
          </div>
          <div class="text-sm text-yellow-800 dark:text-yellow-300 mt-1">เฝ้าระวัง</div>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 transition-colors">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">
            {{ waterStationStore.normalCount }}
          </div>
          <div class="text-sm text-green-800 dark:text-green-300 mt-1">ปกติ</div>
        </div>
      </div>

      <!-- Rainfall Chart -->
      <RainfallChart />

      <!-- Filter -->
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          @click="waterStationStore.clearFilter(); waterStationStore.fetchStations()"
          class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors"
          :class="!waterStationStore.selectedProvince
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          ทั้งหมด
        </button>
        <button
          v-for="province in waterStationStore.provinces"
          :key="province"
          @click="waterStationStore.fetchStationsByProvince(province)"
          class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors"
          :class="waterStationStore.selectedProvince === province
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'"
        >
          {{ province }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="waterStationStore.loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="waterStationStore.error" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400 mb-4">{{ waterStationStore.error }}</p>
        <button
          @click="waterStationStore.fetchStations(true)"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ลองอีกครั้ง
        </button>
      </div>

      <!-- Stations List -->
      <div v-else-if="waterStationStore.filteredStations.length > 0" class="space-y-4">
        <WaterStationCard
          v-for="station in waterStationStore.filteredStations"
          :key="station.id"
          :station="station"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400">ไม่พบข้อมูลสถานีวัดน้ำ</p>
      </div>

      <!-- Official Links -->
      <OfficialLinks />
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { useWaterStationStore } from '~/stores/waterStation'
import WaterStationCard from '~/components/water/WaterStationCard.vue'
import RainfallChart from '~/components/water/RainfallChart.vue'
import OfficialLinks from '~/components/water/OfficialLinks.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import BottomNavigation from '~/components/layout/BottomNavigation.vue'

const waterStationStore = useWaterStationStore()

// Fetch data on mount
onMounted(async () => {
  if (process.client) {
    await waterStationStore.fetchStations()

    // Start auto-refresh
    const interval = waterStationStore.startAutoRefresh()

    // Cleanup on unmount
    onUnmounted(() => {
      if (interval) {
        clearInterval(interval)
      }
    })
  }
})

// Page metadata
useHead({
  title: 'ระดับน้ำสถานีวัด - TANGROD',
  meta: [
    {
      name: 'description',
      content: 'ตรวจสอบระดับน้ำจากสถานีวัดทั่วประเทศ อัปเดตแบบเรียลไทม์ทุก 10 นาที'
    }
  ]
})
</script>

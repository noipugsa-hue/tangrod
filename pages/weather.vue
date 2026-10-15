<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 pb-20">
    <!-- Header -->
    <div class="p-4 text-white">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">พยากรณ์อากาศ</h1>
        <button @click="refresh" class="p-2 hover:bg-white/20 rounded-full">
          <ArrowPathIcon class="w-6 h-6" />
        </button>
      </div>
      <p v-if="currentAddress" class="text-sm opacity-90 mt-1">
        {{ currentAddress.district }}, {{ currentAddress.province }}
      </p>
    </div>

    <!-- Current Weather -->
    <div class="px-4 py-6">
      <div class="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-white">
        <div class="text-center">
          <div class="text-7xl mb-4">{{ weatherIcon }}</div>
          <div class="text-6xl font-bold mb-2">{{ temperature }}°</div>
          <div class="text-xl mb-4">{{ weatherDescription }}</div>

          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="text-center">
              <div class="text-3xl mb-1">💧</div>
              <div class="text-sm opacity-80">ความชื้น</div>
              <div class="font-semibold">{{ humidity }}%</div>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-1">🌧️</div>
              <div class="text-sm opacity-80">ฝน</div>
              <div class="font-semibold">{{ rainfall }} มม.</div>
            </div>
            <div class="text-center">
              <div class="text-3xl mb-1">💨</div>
              <div class="text-sm opacity-80">ลม</div>
              <div class="font-semibold">{{ windSpeed }} กม./ชม.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hourly Forecast -->
    <div class="px-4">
      <h2 class="text-white font-semibold mb-3">พยากรณ์รายชั่วโมง</h2>
      <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4">
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div
            v-for="hour in hourlyForecast"
            :key="hour.time"
            class="flex-shrink-0 text-center text-white"
          >
            <div class="text-sm opacity-80 mb-2">{{ hour.time }}</div>
            <div class="text-3xl mb-2">{{ hour.icon }}</div>
            <div class="font-semibold">{{ hour.temp }}°</div>
            <div class="text-xs opacity-70 mt-1">{{ hour.rain }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Forecast -->
    <div class="px-4 mt-6">
      <h2 class="text-white font-semibold mb-3">พยากรณ์ 7 วัน</h2>
      <div class="bg-white rounded-2xl p-4 space-y-3">
        <div
          v-for="day in dailyForecast"
          :key="day.day"
          class="flex items-center justify-between"
        >
          <div class="flex-1">
            <div class="font-semibold">{{ day.day }}</div>
            <div class="text-sm text-gray-600">{{ day.description }}</div>
          </div>
          <div class="text-3xl mx-4">{{ day.icon }}</div>
          <div class="text-right">
            <div class="font-semibold">{{ day.high }}°</div>
            <div class="text-sm text-gray-500">{{ day.low }}°</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rain Radar (Mock) -->
    <div class="px-4 mt-6 pb-6">
      <h2 class="text-white font-semibold mb-3">แผนที่เรดาร์ฝน</h2>
      <div class="bg-white rounded-2xl p-4">
        <div class="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
          <p class="text-gray-600">แผนที่เรดาร์ฝน</p>
        </div>
        <p class="text-xs text-gray-500 mt-2 text-center">
          อัพเดท: {{ new Date().toLocaleTimeString('th-TH') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useLocationStore } from '~/stores/location'

const locationStore = useLocationStore()
const currentAddress = computed(() => locationStore.currentAddress)

// Mock weather data
const temperature = ref(28)
const humidity = ref(75)
const rainfall = ref(12)
const windSpeed = ref(15)
const weatherIcon = ref('⛅')
const weatherDescription = ref('เมฆบางส่วน มีฝนฟ้าคะนอง')

const hourlyForecast = ref([
  { time: 'ตอนนี้', icon: '⛅', temp: 28, rain: 60 },
  { time: '13:00', icon: '🌧️', temp: 27, rain: 80 },
  { time: '14:00', icon: '🌧️', temp: 26, rain: 90 },
  { time: '15:00', icon: '⛈️', temp: 25, rain: 95 },
  { time: '16:00', icon: '🌧️', temp: 26, rain: 70 },
  { time: '17:00', icon: '⛅', temp: 27, rain: 40 },
  { time: '18:00', icon: '🌤️', temp: 28, rain: 20 }
])

const dailyForecast = ref([
  { day: 'วันนี้', description: 'ฝนฟ้าคะนอง', icon: '⛈️', high: 32, low: 24 },
  { day: 'พรุ่งนี้', description: 'มีฝนตกหนัก', icon: '🌧️', high: 30, low: 23 },
  { day: 'พุธ', description: 'ฝนฟ้าคะนอง', icon: '⛈️', high: 31, low: 24 },
  { day: 'พฤหัสบดี', description: 'เมฆมาก', icon: '☁️', high: 33, low: 25 },
  { day: 'ศุกร์', description: 'แดดร้อน', icon: '☀️', high: 35, low: 26 },
  { day: 'เสาร์', description: 'มีเมฆบางส่วน', icon: '🌤️', high: 34, low: 25 },
  { day: 'อาทิตย์', description: 'ฝนเล็กน้อย', icon: '🌦️', high: 32, low: 24 }
])

async function refresh() {
  // In production, this would fetch real weather data from API
  await locationStore.getCurrentLocation()
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
}

onMounted(() => {
  if (!locationStore.currentLocation) {
    locationStore.getCurrentLocation()
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
        ปริมาณฝน 24 ชั่วโมงที่ผ่านมา
      </h3>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        อัปเดต: {{ formattedUpdateTime }}
      </span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Chart -->
    <div v-else class="relative">
      <!-- Y-axis labels -->
      <div class="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{{ maxAmount }}mm</span>
        <span>{{ (maxAmount / 2).toFixed(0) }}mm</span>
        <span>0mm</span>
      </div>

      <!-- Chart area -->
      <div class="ml-12 mr-2">
        <!-- Grid lines -->
        <div class="relative h-48 border-l border-b border-gray-300 dark:border-gray-600">
          <div
            v-for="i in 4"
            :key="i"
            class="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700"
            :style="{ bottom: `${i * 25}%` }"
          ></div>

          <!-- Bars -->
          <div class="absolute inset-0 flex items-end justify-around gap-0.5 px-1">
            <div
              v-for="(data, index) in chartData"
              :key="index"
              class="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer relative group"
              :style="{ height: `${getBarHeight(data.amount)}%` }"
              :title="`${data.hour}: ${data.amount.toFixed(1)}mm`"
            >
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div class="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <div class="font-medium">{{ data.hour }}</div>
                  <div>{{ data.amount.toFixed(1) }} mm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- X-axis labels -->
        <div class="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span v-for="label in xAxisLabels" :key="label">{{ label }}</span>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ totalRainfall.toFixed(1) }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">มม. รวม 24 ชม.</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ averageRainfall.toFixed(1) }}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">มม. เฉลี่ย/ชม.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RainfallData } from '~/types'

const props = defineProps<{
  data?: RainfallData[]
  stationName?: string
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const rainfallData = ref<RainfallData[]>([])

// Fetch data
const fetchData = async () => {
  if (props.data) {
    rainfallData.value = props.data
    return
  }

  loading.value = true
  error.value = null

  try {
    const rainfallService = useRainfallService()
    const history = await rainfallService.getRainfallHistory(props.stationName)
    rainfallData.value = history.hourly
  } catch (err) {
    error.value = 'ไม่สามารถโหลดข้อมูลปริมาณฝนได้'
    console.error('Error fetching rainfall data:', err)
  } finally {
    loading.value = false
  }
}

// Chart data (last 24 hours, hourly)
const chartData = computed(() => {
  const data = rainfallData.value.slice(-24)

  return data.map(d => ({
    hour: new Date(d.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit' }),
    amount: d.amount
  }))
})

// Max amount for scaling
const maxAmount = computed(() => {
  const amounts = chartData.value.map(d => d.amount)
  const max = Math.max(...amounts, 10) // Minimum 10mm for better visualization
  return Math.ceil(max / 10) * 10 // Round up to nearest 10
})

// Calculate bar height percentage
const getBarHeight = (amount: number): number => {
  if (maxAmount.value === 0) return 0
  return (amount / maxAmount.value) * 100
}

// X-axis labels (show every 4 hours)
const xAxisLabels = computed(() => {
  const labels = []
  for (let i = 0; i < chartData.value.length; i += 4) {
    labels.push(chartData.value[i]?.hour || '')
  }
  return labels
})

// Total rainfall
const totalRainfall = computed(() => {
  return chartData.value.reduce((sum, d) => sum + d.amount, 0)
})

// Average rainfall per hour
const averageRainfall = computed(() => {
  if (chartData.value.length === 0) return 0
  return totalRainfall.value / chartData.value.length
})

// Formatted update time
const formattedUpdateTime = computed(() => {
  if (rainfallData.value.length === 0) return '-'

  const latestData = rainfallData.value[rainfallData.value.length - 1]
  const date = new Date(latestData.timestamp)

  return date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Fetch on mount
onMounted(() => {
  if (process.client) {
    fetchData()
  }
})

// Watch for prop changes
watch(() => props.data, () => {
  if (props.data) {
    rainfallData.value = props.data
  }
})

watch(() => props.stationName, () => {
  if (!props.data) {
    fetchData()
  }
})
</script>

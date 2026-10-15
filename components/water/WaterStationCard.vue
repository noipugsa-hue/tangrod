<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 transition-colors"
    :class="borderColorClass"
  >
    <!-- Header -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white text-base">
          {{ station.name }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {{ station.district }}, {{ station.province }}
        </p>
      </div>

      <!-- Status Badge -->
      <span
        class="px-2.5 py-1 rounded-full text-xs font-medium"
        :class="statusBadgeClass"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Water Level Info -->
    <div class="mt-3 flex items-center justify-between">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold" :class="statusTextClass">
          {{ station.currentLevel.toFixed(2) }}
        </span>
        <span class="text-sm text-gray-600 dark:text-gray-400">เมตร</span>
      </div>

      <!-- Trend Icon -->
      <div class="flex items-center gap-1" :class="trendColorClass">
        <component :is="trendIcon" class="w-5 h-5" />
        <span class="text-sm font-medium">{{ trendLabel }}</span>
      </div>
    </div>

    <!-- Threshold Info -->
    <div class="mt-3 space-y-1.5">
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>วิกฤต</span>
        <span class="font-medium">{{ station.criticalLevel.toFixed(2) }} ม.</span>
      </div>
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>เสี่ยงสูง</span>
        <span class="font-medium">{{ station.highRiskLevel.toFixed(2) }} ม.</span>
      </div>
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>เฝ้าระวัง</span>
        <span class="font-medium">{{ station.watchLevel.toFixed(2) }} ม.</span>
      </div>
    </div>

    <!-- Update Time -->
    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        อัปเดต: {{ formattedUpdateTime }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/vue/24/solid'
import type { WaterStation } from '~/types'

const props = defineProps<{
  station: WaterStation
}>()

// Status configurations
const statusConfig = computed(() => {
  switch (props.station.waterLevel) {
    case 'CRITICAL':
      return {
        label: 'วิกฤต',
        borderClass: 'border-red-500',
        badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
        textClass: 'text-red-600 dark:text-red-400'
      }
    case 'HIGH_RISK':
      return {
        label: 'เสี่ยงสูง',
        borderClass: 'border-orange-500',
        badgeClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        textClass: 'text-orange-600 dark:text-orange-400'
      }
    case 'WATCH':
      return {
        label: 'เฝ้าระวัง',
        borderClass: 'border-yellow-500',
        badgeClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
        textClass: 'text-yellow-600 dark:text-yellow-400'
      }
    default:
      return {
        label: 'ปกติ',
        borderClass: 'border-green-500',
        badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        textClass: 'text-green-600 dark:text-green-400'
      }
  }
})

const borderColorClass = computed(() => statusConfig.value.borderClass)
const statusBadgeClass = computed(() => statusConfig.value.badgeClass)
const statusTextClass = computed(() => statusConfig.value.textClass)
const statusLabel = computed(() => statusConfig.value.label)

// Trend configurations
const trendConfig = computed(() => {
  switch (props.station.trend) {
    case 'RISING':
      return {
        icon: ArrowTrendingUpIcon,
        label: 'เพิ่มขึ้น',
        colorClass: 'text-red-600 dark:text-red-400'
      }
    case 'FALLING':
      return {
        icon: ArrowTrendingDownIcon,
        label: 'ลดลง',
        colorClass: 'text-green-600 dark:text-green-400'
      }
    default:
      return {
        icon: MinusIcon,
        label: 'ทรงตัว',
        colorClass: 'text-gray-600 dark:text-gray-400'
      }
  }
})

const trendIcon = computed(() => trendConfig.value.icon)
const trendLabel = computed(() => trendConfig.value.label)
const trendColorClass = computed(() => trendConfig.value.colorClass)

// Format update time
const formattedUpdateTime = computed(() => {
  const date = new Date(props.station.updatedAt)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMinutes < 1) return 'เมื่อสักครู่'
  if (diffMinutes < 60) return `${diffMinutes} นาทีที่แล้ว`
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60)
    return `${hours} ชั่วโมงที่แล้ว`
  }

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

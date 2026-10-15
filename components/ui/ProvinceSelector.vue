<template>
  <div class="relative" ref="dropdownRef">
    <!-- Selected Province Display -->
    <button
      @click="toggleDropdown"
      class="flex items-center justify-between w-full text-left focus:outline-none"
    >
      <div class="flex-1">
        <div class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedProvinceName }}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">ทั่วจังหวัด</div>
      </div>
      <ChevronDownIcon
        :class="[
          'w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform',
          isOpen ? 'rotate-180' : ''
        ]"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
        style="max-height: 400px;"
      >
        <!-- Search Box -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาจังหวัด..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              @keydown.escape="closeDropdown"
            />
          </div>
        </div>

        <!-- Province List -->
        <div class="overflow-y-auto" style="max-height: 320px;">
          <div v-if="filteredProvinces.length === 0" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            ไม่พบจังหวัดที่ค้นหา
          </div>

          <div v-else>
            <!-- Group by region -->
            <div v-for="region in groupedProvinces" :key="region.name" class="border-b border-gray-50 dark:border-gray-700 last:border-0">
              <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 sticky top-0">
                {{ region.name }}
              </div>
              <button
                v-for="province in region.provinces"
                :key="province.id"
                @click="selectProvince(province.id)"
                :class="[
                  'w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between',
                  modelValue === province.id ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200'
                ]"
              >
                <span>{{ province.name }}</span>
                <CheckIcon v-if="modelValue === province.id" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { provinces, getProvinceById, type Province } from '~/utils/provinces'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

const selectedProvinceName = computed(() => {
  const province = getProvinceById(props.modelValue)
  return province?.name || 'เลือกจังหวัด'
})

const filteredProvinces = computed(() => {
  if (!searchQuery.value) return provinces

  const query = searchQuery.value.toLowerCase()
  return provinces.filter(p => p.name.toLowerCase().includes(query))
})

const groupedProvinces = computed(() => {
  const regionNames: Record<Province['region'], string> = {
    north: 'ภาคเหนือ',
    northeast: 'ภาคตะวันออกเหนือ',
    central: 'ภาคกลาง',
    east: 'ภาคตะวันออก',
    west: 'ภาคตะวันตก',
    south: 'ภาคใต้'
  }

  const regions: Array<{ name: string; provinces: Province[] }> = []
  const regionOrder: Province['region'][] = ['central', 'north', 'northeast', 'east', 'west', 'south']

  for (const regionKey of regionOrder) {
    const regionProvinces = filteredProvinces.value.filter(p => p.region === regionKey)
    if (regionProvinces.length > 0) {
      regions.push({
        name: regionNames[regionKey],
        provinces: regionProvinces
      })
    }
  }

  return regions
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
    })
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

const selectProvince = (provinceId: string) => {
  emit('update:modelValue', provinceId)
  closeDropdown()
}

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      closeDropdown()
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4 flex items-center">
      <button @click="$router.back()" class="mr-3">
        <ChevronLeftIcon class="w-6 h-6 text-gray-700" />
      </button>
      <h1 class="text-xl font-bold text-gray-900 flex-1">รายงานสถานการณ์</h1>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitReport" class="p-4 space-y-4">
      <!-- Location -->
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง *</label>
        <div class="mb-2">
          <button
            type="button"
            @click="useCurrentLocation"
            :disabled="loadingLocation"
            class="btn btn-outline w-full flex items-center justify-center"
          >
            <MapPinIcon class="w-5 h-5 mr-2" />
            {{ loadingLocation ? 'กำลังระบุตำแหน่ง...' : 'ใช้ตำแหน่งปัจจุบัน' }}
          </button>
        </div>
        <div v-if="form.location" class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          📍 {{ form.address.district }}, {{ form.address.province }}
        </div>
        <div v-if="locationError" class="text-sm text-red-600 mt-2">
          {{ locationError }}
        </div>
      </div>

      <!-- Severity -->
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">ระดับความรุนแรง *</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="severity in severities"
            :key="severity.value"
            type="button"
            :class="[
              'p-4 rounded-lg border-2 transition-all text-left',
              form.severity === severity.value
                ? 'border-primary-800 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="form.severity = severity.value"
          >
            <div class="font-semibold mb-1">{{ severity.label }}</div>
            <div class="text-xs text-gray-600">{{ severity.description }}</div>
          </button>
        </div>
      </div>

      <!-- Water Level -->
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">ระดับน้ำ (ซม.) *</label>
        <input
          v-model.number="form.waterLevel"
          type="number"
          min="0"
          placeholder="เช่น 30"
          class="input"
          required
        />
      </div>

      <!-- Description -->
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียด *</label>
        <textarea
          v-model="form.description"
          rows="4"
          placeholder="อธิบายสถานการณ์เพิ่มเติม..."
          class="input"
          required
        ></textarea>
      </div>

      <!-- Image Upload -->
      <div class="card">
        <label class="block text-sm font-medium text-gray-700 mb-3">รูปภาพ (ไม่เกิน 3 รูป)</label>

        <!-- Upload Button -->
        <label class="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-800 transition-colors">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="text-center">
            <PhotoIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600">คลิกเพื่อเลือกรูปภาพ</p>
            <p class="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (สูงสุด 5MB)</p>
          </div>
        </label>

        <!-- Image Previews -->
        <div v-if="imagePreviews.length > 0" class="grid grid-cols-3 gap-2 mt-3">
          <div
            v-for="(preview, index) in imagePreviews"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            <img :src="preview" class="w-full h-full object-cover" />
            <button
              type="button"
              @click="removeImage(index)"
              class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="mt-3">
          <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>กำลังอัปโหลดรูปภาพ...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-primary-800 h-2 rounded-full transition-all duration-300"
              :style="`width: ${uploadProgress}%`"
            ></div>
          </div>
        </div>
      </div>

      <!-- Road Passable -->
      <div class="card">
        <label class="flex items-center justify-between cursor-pointer">
          <span class="font-medium text-gray-900">ถนนสามารถผ่านได้</span>
          <input
            v-model="form.roadPassable"
            type="checkbox"
            class="w-5 h-5 text-primary-800 rounded"
          />
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!canSubmit || submitting"
        class="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!submitting">ส่งรายงาน</span>
        <span v-else class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          กำลังส่ง...
        </span>
      </button>

      <!-- Note -->
      <div class="text-center text-sm text-gray-500">
        <p>รายงานของคุณจะถูกตรวจสอบก่อนเผยแพร่</p>
      </div>
    </form>

    <!-- Success Modal -->
    <Transition name="fade">
      <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closeSuccess">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full" @click.stop>
          <div class="text-center">
            <div class="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">ส่งรายงานสำเร็จ!</h3>
            <p class="text-gray-600 mb-6">ขอบคุณที่ช่วยแจ้งสถานการณ์</p>
            <button @click="closeSuccess" class="btn btn-primary w-full">
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, MapPinIcon, CheckCircleIcon, PhotoIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useLocationStore } from '~/stores/location'
import { useAuthStore } from '~/stores/auth'
import { useFirebaseService } from '~/services/firebaseService'
import { useStorageService } from '~/services/storageService'
import type { FloodSeverity, Location, Address } from '~/types'

const router = useRouter()
const locationStore = useLocationStore()
const authStore = useAuthStore()
const firebaseService = useFirebaseService()
const storageService = useStorageService()

const loadingLocation = ref(false)
const locationError = ref<string | null>(null)
const submitting = ref(false)
const showSuccess = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)

// Image handling
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])

const form = reactive({
  location: null as Location | null,
  address: {
    province: '',
    district: '',
    subDistrict: ''
  } as Address,
  severity: '' as FloodSeverity | '',
  waterLevel: 0,
  description: '',
  roadPassable: true
})

const severities = [
  {
    value: 'NONE',
    label: 'ไม่มีน้ำ',
    description: 'ไม่มีน้ำท่วม'
  },
  {
    value: 'MINOR',
    label: 'น้ำขัง',
    description: 'น้ำขังเล็กน้อย'
  },
  {
    value: 'MODERATE',
    label: 'น้ำท่วมปานกลาง',
    description: 'รถผ่านได้แต่ระมัดระวัง'
  },
  {
    value: 'SEVERE',
    label: 'น้ำท่วมสูง',
    description: 'รถเล็กไม่ควรผ่าน'
  },
  {
    value: 'CRITICAL',
    label: 'อันตราย',
    description: 'ไม่สามารถผ่านได้'
  }
]

const canSubmit = computed(() => {
  return (
    form.location !== null &&
    form.severity !== '' &&
    form.waterLevel > 0 &&
    form.description.trim() !== ''
  )
})

const useCurrentLocation = async () => {
  loadingLocation.value = true
  locationError.value = null

  const location = await locationStore.getCurrentLocation()

  if (location) {
    form.location = location

    if (locationStore.currentAddress) {
      form.address = locationStore.currentAddress
    }
  } else {
    locationError.value = locationStore.error || 'ไม่สามารถระบุตำแหน่งได้'
  }

  loadingLocation.value = false
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  // Limit to 3 images
  const maxFiles = 3 - selectedFiles.value.length
  const filesToAdd = Array.from(files).slice(0, maxFiles)

  // Validate file size (5MB max)
  const validFiles = filesToAdd.filter(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`)
      return false
    }
    return true
  })

  // Add files
  selectedFiles.value.push(...validFiles)

  // Create previews
  for (const file of validFiles) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index: number) => {
  selectedFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const submitReport = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  let imageUrls: string[] = []

  try {
    // Get user ID (or use 'guest' if not authenticated)
    const userId = authStore.user?.id || 'guest'

    // Upload images if any
    if (selectedFiles.value.length > 0) {
      uploading.value = true
      uploadProgress.value = 0

      try {
        // Resize images before upload
        const resizedFiles: File[] = []
        for (let i = 0; i < selectedFiles.value.length; i++) {
          const resized = await storageService.resizeImage(selectedFiles.value[i])
          resizedFiles.push(resized)
          uploadProgress.value = Math.round(((i + 1) / selectedFiles.value.length) * 50)
        }

        // Generate temporary report ID
        const tempReportId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Upload images
        imageUrls = await storageService.uploadReportImages(resizedFiles, tempReportId)
        uploadProgress.value = 100
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError)
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่')
        return
      } finally {
        uploading.value = false
        uploadProgress.value = 0
      }
    }

    // Create report with image URLs
    const reportId = await firebaseService.createFloodReport({
      userId,
      location: form.location!,
      address: form.address,
      severity: form.severity as FloodSeverity,
      waterLevel: form.waterLevel,
      description: form.description,
      images: imageUrls,
      roadPassable: form.roadPassable,
      verified: false,
      likes: 0
    })

    console.log('Report created with ID:', reportId)

    // Show success modal
    showSuccess.value = true
  } catch (error) {
    console.error('Error submitting report:', error)
    alert('เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง')
  } finally {
    submitting.value = false
  }
}

const closeSuccess = () => {
  showSuccess.value = false
  router.push('/report')
}

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

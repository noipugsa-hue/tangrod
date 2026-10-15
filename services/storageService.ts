import { ref, uploadBytes, getDownloadURL, deleteObject, type Storage } from 'firebase/storage'

export class StorageService {
  private storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      // Create a reference
      const storageRef = ref(this.storage, path)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      return downloadURL
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  async uploadReportImages(files: File[], reportId: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = `reports/${reportId}/${Date.now()}_${index}_${file.name}`
      return this.uploadImage(file, path)
    })

    return Promise.all(uploadPromises)
  }

  async deleteImage(url: string): Promise<void> {
    try {
      const imageRef = ref(this.storage, url)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  // Resize image before upload (client-side)
  async resizeImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Failed to resize image'))
            }
          }, 'image/jpeg', 0.8)
        }

        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }
}

// Composable for easy access
export const useStorageService = () => {
  const { $firebase } = useNuxtApp()
  return new StorageService($firebase.storage as Storage)
}

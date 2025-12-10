export const useFileUpload = () => {
    const uploading = ref(false)
    const error = ref<string | null>(null)

    const uploadFile = async (file: File) => {
        uploading.value = true
        error.value = null
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // In a real app, use FormData and fetch to backend
            // const formData = new FormData()
            // formData.append('file', file)
            // const { url } = await $fetch('/api/upload', { method: 'POST', body: formData })

            // Mock URL for now
            const mockUrl = `https://storage.clinic.com/${Date.now()}_${file.name}`
            return mockUrl
        } catch (e: any) {
            error.value = e.message || 'Error uploading file'
            throw e
        } finally {
            uploading.value = false
        }
    }

    return { uploadFile, uploading, error }
}

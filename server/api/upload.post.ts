import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    if (!files || files.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'No se enviaron archivos' })
    }

    const uploadedPaths: string[] = []

    // Ensure public/uploads exists
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    for (const file of files) {
        if (file.filename) {
            const ext = file.filename.split('.').pop()
            const uniqueName = `${randomUUID()}.${ext}`
            const filePath = join(uploadDir, uniqueName)

            await writeFile(filePath, file.data)

            // Return public URL (Nuxt serves public dir at root)
            uploadedPaths.push(`/uploads/${uniqueName}`)
        }
    }

    // Return single URL if one file, or array
    return {
        urls: uploadedPaths,
        message: 'Archivos subidos correctamente'
    }
})

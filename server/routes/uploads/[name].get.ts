import { join } from 'path'
import { readFile, stat } from 'fs/promises'
import { createError, defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const fileName = event.context.params?.name
    if (!fileName) {
        throw createError({ statusCode: 400, message: 'Invalid filename' })
    }

    // Sanitize filename to prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        throw createError({ statusCode: 403, message: 'Invalid filename' })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', fileName)

    try {
        const stats = await stat(filePath)
        if (!stats.isFile()) {
            throw new Error('Not a file')
        }

        const fileBuffer = await readFile(filePath)

        // Determine mime type (basic)
        const ext = fileName.split('.').pop()?.toLowerCase()
        let mimeType = 'application/octet-stream'
        if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
        if (ext === 'png') mimeType = 'image/png'
        if (ext === 'pdf') mimeType = 'application/pdf'
        if (ext === 'webp') mimeType = 'image/webp'

        setHeader(event, 'Content-Type', mimeType)
        return fileBuffer
    } catch (error) {
        throw createError({ statusCode: 404, message: 'Image not found' })
    }
})

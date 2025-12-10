

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const body = await readBody(event)
    const { titulo, contenido, tipo, rutaArchivo } = body

    if (!titulo || !contenido) {
        throw createError({ statusCode: 400, statusMessage: 'Título y contenido requeridos' })
    }

    const template = await prisma.plantilla.create({
        data: {
            titulo,
            contenido,
            tipo: tipo || 'GENERAL',
            rutaArchivo
        }
    })
    return template
})

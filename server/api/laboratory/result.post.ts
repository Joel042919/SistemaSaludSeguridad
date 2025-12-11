import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user

    // Only Lab or Admin can enter results
    if (!user || (user.rol !== 'LABORATORIO' && user.rol !== 'ADMINISTRADOR')) {
        throw createError({ statusCode: 403, statusMessage: 'Solo laboratorio puede ingresar resultados' })
    }

    const { id, resultados, conclusiones, archivosUrl } = body

    if (!id || !resultados) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos/resultados' })
    }

    const exam = await prisma.examenRealizado.update({
        where: { id },
        data: {
            resultados,
            conclusiones,
            archivosUrl: archivosUrl || [],
            estado: 'COMPLETADO',
            updatedAt: new Date()
        }
    })

    return exam
})

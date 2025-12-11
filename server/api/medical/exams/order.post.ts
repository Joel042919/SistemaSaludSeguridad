import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user

    if (!user || (user.rol !== 'MEDICO' && user.rol !== 'ADMINISTRADOR')) {
        throw createError({ statusCode: 403, statusMessage: 'Solo médicos pueden ordenar exámenes' })
    }

    const { historiaId, tipoExamen, observaciones } = body

    if (!historiaId || !tipoExamen) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos requeridos' })
    }

    // Determine medicoId
    let medicoId = null
    if (user.rol === 'MEDICO') {
        const medico = await prisma.medico.findUnique({ where: { usuarioId: user.id } })
        if (medico) medicoId = medico.id
    }

    try {
        const exam = await prisma.examenRealizado.create({
            data: {
                historiaId,
                tipoExamen,
                medicoId,
                observaciones,
                estado: 'PENDIENTE',
                resultados: {} // Empty initially
            }
        })
        return exam
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: 'Error al ordenar examen' })
    }
})

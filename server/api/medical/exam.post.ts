

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Determine medicoId
    let medicoId = null
    if (user.rol === 'MEDICO') {
        const medico = await prisma.medico.findUnique({
            where: { usuarioId: user.id }
        })
        if (medico) medicoId = medico.id
    }

    const { historiaId, tipoExamen, resultados, conclusiones, observaciones, archivosUrl } = body

    if (!historiaId || !tipoExamen) {
        throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
    }

    try {
        const exam = await prisma.examenRealizado.create({
            data: {
                historiaId,
                tipoExamen,
                medicoId,
                resultados: resultados || {},
                conclusiones,
                observaciones,
                archivosUrl: archivosUrl || [],
                estado: 'COMPLETADO'
            }
        })
        return exam
    } catch (e) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: 'Error creating exam' })
    }
})

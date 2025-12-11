

export default defineEventHandler(async (event) => {
    const citaId = getRouterParam(event, 'citaId')
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (!citaId) {
        throw createError({ statusCode: 400, statusMessage: 'Cita ID required' })
    }

    // 1. Get Cita to verify ownership or existence and get data
    const cita = await prisma.cita.findUnique({
        where: { id: citaId },
        include: {
            paciente: true,
            protocolo: true,
            medico: { include: { usuario: true } }
        }
    })

    if (!cita) {
        throw createError({ statusCode: 404, statusMessage: 'Cita not found' })
    }

    // 2. Find or Create HistoriaClinica
    const history = await prisma.historiaClinica.upsert({
        where: { citaId },
        update: {},
        create: {
            citaId,
            pacienteId: cita.pacienteId
        },
        include: {
            paciente: {
                include: { empresa: true }
            },
            examenes: true
        }
    })

    // Return combined data (History + Cita context)
    return {
        ...history,
        cita: {
            id: cita.id,
            fechaProgramada: cita.fechaProgramada,
            protocolo: cita.protocolo,
            estado: cita.estado,
            medico: cita.medico
        }
    }
})

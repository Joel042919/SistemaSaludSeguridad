
export default defineEventHandler(async (event) => {
    const user = event.context.user
    // Strict auth check turned on
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // Determine medicoId if role is MEDICO
    let medicoId = null
    if (user.rol === 'MEDICO') {
        const medico = await prisma.medico.findUnique({
            where: { usuarioId: user.id }
        })
        if (!medico) {
            throw createError({ statusCode: 403, statusMessage: 'Perfil de médico no encontrado para este usuario' })
        }
        medicoId = medico.id
    }

    // Query appointments
    const where: any = {}
    if (medicoId) {
        where.medicoId = medicoId
    }

    // Filter by status if query param exists
    const query = getQuery(event)
    if (query.status) {
        where.estado = query.status
    }

    const appointments = await prisma.cita.findMany({
        where,
        include: {
            paciente: {
                select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    numDoc: true,
                    fotoUrl: true,
                    empresa: { select: { razonSocial: true } }
                }
            },
            protocolo: {
                select: { nombre: true }
            },
            medico: {
                include: { usuario: { select: { nombres: true, apellidos: true } } }
            }
        },
        orderBy: { fechaProgramada: 'asc' }
    })

    return appointments
})

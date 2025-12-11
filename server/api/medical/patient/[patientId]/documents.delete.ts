

export default defineEventHandler(async (event) => {
    const patientId = getRouterParam(event, 'patientId')
    const body = await readBody(event)

    if (!patientId) {
        throw createError({ statusCode: 400, statusMessage: 'ID de paciente requerido' })
    }

    const { index } = body

    if (index === undefined || index === null) {
        throw createError({ statusCode: 400, statusMessage: 'Índice requerido' })
    }

    // Get current patient docs
    const patient = await prisma.paciente.findUnique({
        where: { id: patientId },
        select: { documentos: true }
    })

    if (!patient) {
        throw createError({ statusCode: 404, statusMessage: 'Paciente no encontrado' })
    }

    // Remove doc at index
    const currentDocs = (patient.documentos as any[]) || []
    if (index >= 0 && index < currentDocs.length) {
        currentDocs.splice(index, 1)
    }

    const updated = await prisma.paciente.update({
        where: { id: patientId },
        data: {
            documentos: currentDocs
        }
    })

    return updated
})


export default defineEventHandler(async (event) => {
    const patientId = getRouterParam(event, 'patientId')
    const body = await readBody(event)

    if (!patientId) {
        throw createError({ statusCode: 400, statusMessage: 'ID de paciente requerido' })
    }

    const { categoria, url, nombreOriginal } = body

    if (!categoria || !url || !nombreOriginal) {
        throw createError({ statusCode: 400, statusMessage: 'Datos incompletos (categoria, url, nombreOriginal)' })
    }

    // Get current patient docs
    const patient = await prisma.paciente.findUnique({
        where: { id: patientId },
        select: { documentos: true }
    })

    if (!patient) {
        throw createError({ statusCode: 404, statusMessage: 'Paciente no encontrado' })
    }

    // Append new doc
    const currentDocs = (patient.documentos as any[]) || []
    const newDocs = [...currentDocs, { categoria, url, nombreOriginal }]

    const updated = await prisma.paciente.update({
        where: { id: patientId },
        data: {
            documentos: newDocs
        }
    })

    return updated
})

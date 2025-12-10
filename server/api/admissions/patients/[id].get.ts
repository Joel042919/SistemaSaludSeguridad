
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    // Explicit Prisma import removed as per project pattern
    const patient = await prisma.paciente.findUnique({
        where: { id },
        include: {
            empresa: true
        }
    })

    if (!patient) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Paciente no encontrado'
        })
    }

    return patient
})

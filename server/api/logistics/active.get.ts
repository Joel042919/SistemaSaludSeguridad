import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    // Fetch all tracking that is NOT "ENTREGADO" or similar final state if we had one.
    // Assuming INFORME_DISPONIBLE is the last one tracked here but still active until patient picks up? 
    // For now, fetch all.

    const trackings = await prisma.seguimientoLogistico.findMany({
        include: {
            cita: {
                include: {
                    paciente: true,
                    protocolo: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })

    return trackings
})

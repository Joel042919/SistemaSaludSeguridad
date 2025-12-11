import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const citaId = query.citaId as string

    const tracking = await prisma.seguimientoLogistico.findUnique({
        where: { citaId },
        include: {
            historial: {
                orderBy: { timestamp: 'desc' },
                include: {
                    // We might not have user relation in HistorialLogistica in schema? 
                    // Checked schema, it has usuarioId but no relation defined to Usuario model in schema.
                    // Checking schema... "usuarioId String". No relation.
                    // So we can't include user details easily unless we fix schema or just show ID.
                    // Let's leave as is for now.
                }
            }
        }
    })

    return tracking
})

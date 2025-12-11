import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    // Any role can update? Maybe restrict. Allowing Logistica, Lab, Medico.

    const body = await readBody(event)
    const { citaId, estado, ubicacion, observacion } = body

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
        // Find existing Tracking or Create if not exists (upsert logic if Cita just created)
        // Usually created on Invoice Payment or Cita Creation? 
        // Let's assume we Upsert based on CitaId

        const tracking = await tx.seguimientoLogistico.upsert({
            where: { citaId },
            create: {
                citaId,
                estadoActual: estado,
                ubicacionActual: ubicacion
            },
            update: {
                estadoActual: estado,
                ubicacionActual: ubicacion
            }
        })

        // Add History
        await tx.historialLogistica.create({
            data: {
                seguimientoId: tracking.id,
                estado: estado,
                ubicacion: ubicacion,
                usuarioId: user ? user.id : 'SYSTEM',
                observacion
            }
        })

        return tracking
    })

    return result
})

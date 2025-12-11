import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || user.rol !== 'TESORERIA') {
        throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
    }

    const { cajaId, montoCierre } = await readBody(event)

    const caja = await prisma.caja.findUnique({ where: { id: cajaId } })
    if (!caja || caja.estado !== 'ABIERTA') {
        throw createError({ statusCode: 400, statusMessage: 'Caja no encontrada o ya cerrada' })
    }

    const updatedCaja = await prisma.caja.update({
        where: { id: cajaId },
        data: {
            estado: 'CERRADA',
            fechaCierre: new Date(),
            montoCierre: montoCierre
        }
    })

    return updatedCaja
})

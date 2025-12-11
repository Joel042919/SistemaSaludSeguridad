import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) return null

    // 1. Prioridad: Caja Abierta
    let caja = await prisma.caja.findFirst({
        where: {
            usuarioId: user.id,
            estado: 'ABIERTA'
        }
    })

    if (caja) {
        console.log('Caja Abierta encontrada:', caja.id)
        return caja
    }

    // 2. Si no hay abierta, buscar si hubo alguna hoy (para evitar pedir apertura si ya cerró?)
    // El usuario pide "que solo me pregunte si respecto al dia de hoy no ha sido registrada"
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    caja = await prisma.caja.findFirst({
        where: {
            usuarioId: user.id,
            fechaApertura: { gte: today }
        },
        orderBy: { fechaApertura: 'desc' }
    })

    console.log('Estado Caja (Hoy):', caja ? caja.estado : 'Ninguna')
    return caja
})

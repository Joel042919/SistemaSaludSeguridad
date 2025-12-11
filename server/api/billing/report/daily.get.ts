import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || user.rol !== 'TESORERIA') return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Agrupar pagos por medio de pago
    const pagos = await prisma.pago.groupBy({
        by: ['medioPago'],
        _sum: {
            monto: true
        },
        where: {
            fechaPago: {
                gte: today
            }
        }
    })

    const facturas = await prisma.factura.findMany({
        where: {
            fechaEmision: { gte: today }
        },
        include: {
            usuario: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const cajas = await prisma.caja.findMany({
        where: {
            fechaApertura: { gte: today },
            usuarioId: user.id
        },
        orderBy: { fechaApertura: 'desc' }
    })

    return {
        resumen: pagos.map(p => ({ medio: p.medioPago, total: p._sum.monto })),
        movimientos: facturas,
        cajas: cajas
    }
})

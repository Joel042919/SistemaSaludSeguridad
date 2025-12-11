import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    // 1. Total Pacientes Hoy (Citas Programadas o Atendidas hoy)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const pacientesHoy = await prisma.cita.count({
        where: {
            fechaProgramada: { gte: today, lt: new Date(today.getTime() + 86400000) },
            estado: { not: 'CANCELADO' }
        }
    })

    // 2. Ingresos del Mes Actual
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const ingresos = await prisma.factura.aggregate({
        _sum: { total: true },
        where: {
            fechaEmision: { gte: startOfMonth },
            estadoPago: 'PAGADO'
        }
    })

    // 3. Inventario Bajo Stock (Alerta)
    const stockCritico = await prisma.inventarioItem.count({
        where: {
            stockActual: { lte: prisma.inventarioItem.fields.stockMinimo }
        }
    })

    // 4. Servicios Pendientes (Logística)
    const pendientesLaboratorio = await prisma.seguimientoLogistico.count({
        where: {
            estadoActual: { in: ['MUESTRA_TOMADA', 'EN_CAMINO', 'EN_LABORATORIO', 'PROCESANDO'] }
        }
    })

    return {
        pacientesHoy,
        ingresosMes: ingresos._sum.total || 0,
        stockCritico,
        pendientesLaboratorio
    }
})

import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    // Ensure user has access
    const user = event.context.user
    if (user?.rol !== 'ADMINISTRADOR' && user?.rol !== 'TESORERIA') {
        throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
    }

    // 1. Income by Client (Top 10)
    const incomeByClientGroup = await prisma.factura.groupBy({
        by: ['clienteNombre'],
        _sum: {
            total: true
        },
        where: {
            estadoPago: 'PAGADO'
        },
        orderBy: {
            _sum: {
                total: 'desc'
            }
        },
        take: 10
    })

    const topClients = incomeByClientGroup.map(item => ({
        name: item.clienteNombre,
        total: Number(item._sum.total || 0)
    }))

    // 2. Daily Income (Last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Prisma doesn't support grouping by DATE(truncated) natively in groupBy easily.
    // We can fetch all and aggregate in JS or use queryRaw.
    // Given the likely volume for this system, JS aggregation for 30 days is acceptable and DB-agnostic safer.

    const invoices = await prisma.factura.findMany({
        where: {
            fechaEmision: { gte: thirtyDaysAgo },
            estadoPago: 'PAGADO'
        },
        select: {
            fechaEmision: true,
            total: true
        },
        orderBy: { fechaEmision: 'asc' }
    })

    const dailyMap = new Map<string, number>()
    invoices.forEach(inv => {
        const day = inv.fechaEmision.toISOString().split('T')[0]
        const amount = Number(inv.total)
        dailyMap.set(day, (dailyMap.get(day) || 0) + amount)
    })

    const dailyIncome = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }))

    return {
        topClients,
        dailyIncome
    }
})

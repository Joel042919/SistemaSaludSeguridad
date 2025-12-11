import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    // Optional: Filter by Category, Low Stock, Provider
    const query = getQuery(event)
    const category = query.category as string

    const where: any = {}
    if (category && category !== 'TODOS') {
        where.categoria = category
    }

    const items = await prisma.inventarioItem.findMany({
        where,
        include: {
            proveedor: true
        },
        orderBy: { nombre: 'asc' }
    })

    return items
})

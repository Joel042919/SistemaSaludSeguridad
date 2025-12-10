

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const search = query.q as string

    if (!search) return []

    const companies = await prisma.empresa.findMany({
        where: {
            OR: [
                { ruc: { contains: search } },
                { razonSocial: { contains: search, mode: 'insensitive' } }
            ]
        },
        include: {
            protocolos: {
                where: { activo: true },
                select: { id: true, nombre: true, precioBase: true }
            }
        },
        take: 10
    })
    return companies
})

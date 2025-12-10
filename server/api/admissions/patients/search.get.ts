

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const search = query.q as string

    if (!search || search.length < 3) return []

    const patients = await prisma.paciente.findMany({
        where: {
            OR: [
                { numDoc: { contains: search } }, // Case insensitive if DB supports it or exact match
                { nombres: { contains: search, mode: 'insensitive' } },
                { apellidos: { contains: search, mode: 'insensitive' } }
            ]
        },
        include: {
            empresa: true
        },
        take: 10
    })

    return patients
})

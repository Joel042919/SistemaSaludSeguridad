import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string

    if (!q || q.length < 3) {
        return []
    }

    const patients = await prisma.paciente.findMany({
        where: {
            OR: [
                { numDoc: { contains: q, mode: 'insensitive' } },
                { nombres: { contains: q, mode: 'insensitive' } },
                { apellidos: { contains: q, mode: 'insensitive' } }
            ]
        },
        take: 10,
        select: {
            id: true,
            nombres: true,
            apellidos: true,
            numDoc: true,
            tipoDoc: true
        }
    })

    return patients
})

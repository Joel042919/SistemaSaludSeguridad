import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user

    // Allow Lab, Admin, and maybe Doctor to see status
    if (!user) {
        throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
    }

    const pendingExams = await prisma.examenRealizado.findMany({
        where: {
            estado: 'PENDIENTE'
        },
        include: {
            historia: {
                include: {
                    paciente: true
                }
            },
            medico: {
                include: {
                    usuario: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    return pendingExams
})

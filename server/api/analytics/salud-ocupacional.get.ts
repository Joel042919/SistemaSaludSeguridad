import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    // 1. Distribution of Aptitudes (Fit, Unfit, Restrictions)
    const aptitudesGroup = await prisma.conceptoAptitud.groupBy({
        by: ['aptitud'],
        _count: {
            id: true
        }
    })

    const aptitudes = aptitudesGroup.map(item => ({
        status: item.aptitud,
        count: item._count.id
    }))

    // 2. Top 5 Exams Performed
    const examsGroup = await prisma.examenRealizado.groupBy({
        by: ['tipoExamen'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 5
    })

    const topExams = examsGroup.map(item => ({
        name: item.tipoExamen,
        count: item._count.id
    }))

    // 3. Trends? (Optional, maybe for future)

    return {
        aptitudes,
        topExams
    }
})

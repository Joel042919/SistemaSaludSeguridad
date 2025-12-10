

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const companyId = query.companyId as string

    const whereClause: any = { activo: true }
    if (companyId) {
        whereClause.empresaId = companyId
    }

    const protocols = await prisma.protocolo.findMany({
        where: whereClause,
        select: {
            id: true,
            nombre: true,
            precioBase: true,
            empresa: {
                select: { razonSocial: true }
            }
        }
    })
    return protocols
})

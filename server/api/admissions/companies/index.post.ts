

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { ruc, razonSocial, direccion, protocols } = body

    if (!ruc || !razonSocial) {
        throw createError({ statusCode: 400, statusMessage: 'RUC y Razón Social requeridos' })
    }

    const company = await prisma.empresa.create({
        data: {
            ruc,
            razonSocial,
            direccion,
            protocolos: protocols && protocols.length > 0 ? {
                create: protocols.map((p: any) => ({
                    nombre: p.nombre,
                    precioBase: p.precioBase || 0,
                    examenes: {}, // Default empty
                    activo: true
                }))
            } : undefined
        }
    })
    return company
})

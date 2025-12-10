
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { nombre, empresaId, precioBase } = body

    if (!nombre || !empresaId) {
        throw createError({ statusCode: 400, statusMessage: 'Nombre y Empresa son requeridos' })
    }

    const protocol = await prisma.protocolo.create({
        data: {
            nombre,
            empresaId,
            precioBase: precioBase || 0,
            examenes: {},
            activo: true
        }
    })
    return protocol
})

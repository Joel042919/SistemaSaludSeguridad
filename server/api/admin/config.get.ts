export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const config = await prisma.configuracion.findFirst()
    return config || {}
})

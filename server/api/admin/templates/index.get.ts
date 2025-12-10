

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const templates = await prisma.plantilla.findMany()
    return templates
})

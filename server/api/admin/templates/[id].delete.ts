

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')

    await prisma.plantilla.delete({
        where: { id }
    })
    return { success: true }
})

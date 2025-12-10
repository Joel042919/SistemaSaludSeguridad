

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')

    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

    await prisma.usuario.delete({
        where: { id }
    })

    return { success: true }
})

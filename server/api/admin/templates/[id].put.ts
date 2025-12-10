

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    const updated = await prisma.plantilla.update({
        where: { id },
        data: body
    })
    return updated
})

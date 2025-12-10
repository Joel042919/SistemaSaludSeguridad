

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const body = await readBody(event)

    // Check if exists
    const existing = await prisma.configuracion.findFirst()

    if (existing) {
        const updated = await prisma.configuracion.update({
            where: { id: existing.id },
            data: body
        })
        return updated
    } else {
        const created = await prisma.configuracion.create({
            data: body
        })
        return created
    }
})

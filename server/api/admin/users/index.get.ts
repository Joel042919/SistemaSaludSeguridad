

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const users = await prisma.usuario.findMany({
        select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
            rol: true,
            dni: true,
            activo: true
        }
    })
    return users
})



export default defineEventHandler(async (event) => {
    // Get users with role MEDICO
    const doctors = await prisma.usuario.findMany({
        where: { rol: 'MEDICO', activo: true },
        select: {
            id: true,
            nombres: true,
            apellidos: true,
            medicoPerfil: {
                select: {
                    id: true,
                    especialidad: true,
                    cmp: true
                }
            }
        }
    })
    return doctors
})


import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { email, password, nombres, apellidos, dni, telefono, rol, activo } = body

    const updateData: any = {
        email,
        nombres,
        apellidos,
        dni,
        telefono,
        rol,
        activo
    }

    if (password && password.trim() !== '') {
        updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    try {
        const updatedUser = await prisma.usuario.update({
            where: { id },
            data: updateData
        })
        return { success: true, user: updatedUser }
    } catch (e: any) {
        if (e.code === 'P2025') {
            throw createError({ statusCode: 404, statusMessage: 'Usuario no encontrado' })
        }
        throw e
    }
})


import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    requireAdmin(event)
    const body = await readBody(event)
    const { email, password, nombres, apellidos, dni, telefono, rol, activo } = body

    if (!email || !password || !nombres || !apellidos) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos requeridos' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const newUser = await prisma.usuario.create({
            data: {
                email,
                passwordHash: hashedPassword,
                nombres,
                apellidos,
                dni,
                telefono,
                rol,
                activo: activo ?? true
            }
        })
        return { success: true, user: newUser }
    } catch (e: any) {
        if (e.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'El email o DNI ya existe' })
        }
        throw e
    }
})

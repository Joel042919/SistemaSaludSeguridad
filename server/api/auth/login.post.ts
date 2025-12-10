import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email y contraseña son requeridos',
        })
    }

    const user = await prisma.usuario.findUnique({
        where: { email },
    })

    if (!user || !user.activo) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Credenciales inválidas',
        })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Credenciales inválidas',
        })
    }

    const config = useRuntimeConfig()
    const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol, nombres: user.nombres },
        config.jwtSecret,
        { expiresIn: '8h' }
    )

    // Set cookie
    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
    })

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            nombres: user.nombres,
            apellidos: user.apellidos,
            rol: user.rol,
        },
    }
})

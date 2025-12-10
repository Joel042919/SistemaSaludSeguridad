import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
    const token = getCookie(event, 'auth_token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'No autenticado',
        })
    }

    const config = useRuntimeConfig()

    try {
        const decoded = jwt.verify(token, config.jwtSecret)
        return { user: decoded }
    } catch (err) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido',
        })
    }
})

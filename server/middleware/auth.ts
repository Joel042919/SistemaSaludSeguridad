import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret)
            event.context.user = decoded
        } catch (err) {
            // Token invalid or expired
            event.context.user = null
        }
    }
})

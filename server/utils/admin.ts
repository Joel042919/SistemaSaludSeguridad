export const requireAdmin = (event: any) => {
    if (event.context.user?.rol !== 'ADMINISTRADOR') {
        throw createError({
            statusCode: 403,
            statusMessage: 'Acceso denegado: Se requiere rol de Administrador',
        })
    }
}

import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user || user.rol !== 'TESORERIA') {
        throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
    }

    const body = await readBody(event)
    const { montoApertura } = body

    // Validar si ya tiene caja abierta
    const cajaAbierta = await prisma.caja.findFirst({
        where: {
            usuarioId: user.id,
            estado: 'ABIERTA'
        }
    })

    if (cajaAbierta) {
        throw createError({ statusCode: 400, statusMessage: 'Ya tienes una caja abierta' })
    }

    const nuevaCaja = await prisma.caja.create({
        data: {
            usuarioId: user.id,
            nombre: `Caja ${user.nombres}`,
            montoApertura: montoApertura || 0,
            estado: 'ABIERTA'
        }
    })

    // Registrar movimiento inicial
    await prisma.movimientoCaja.create({
        data: {
            cajaId: nuevaCaja.id,
            tipo: 'INGRESO',
            monto: montoApertura || 0,
            descripcion: 'Apertura de Caja',
            usuarioId: user.id
        }
    })

    return nuevaCaja
})

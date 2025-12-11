import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) throw createError({ statusCode: 403, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const { itemId, tipo, cantidad, costoUnitario, motivo, documentoRef, lote, fechaVencimiento, proveedorId } = body

    // Validations
    if (!itemId || !tipo || !cantidad) {
        throw createError({ statusCode: 400, statusMessage: 'Datos incompletos' })
    }

    const qty = Number(cantidad)
    const cost = Number(costoUnitario || 0)

    // Transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
        const item = await tx.inventarioItem.findUnique({ where: { id: itemId } })
        if (!item) throw new Error('Item no encontrado')

        const currentStock = Number(item.stockActual)
        const currentAvgCost = Number(item.costoPromedio)

        let newStock = 0
        let newAvgCost = currentAvgCost
        let totalValued = 0

        if (tipo === 'INGRESO') {
            newStock = currentStock + qty

            // Calculate Weighted Average Cost
            // ((StockActual * CostoPromedio) + (CantidadIngreso * CostoIngreso)) / NuevoStock
            const totalOldValue = currentStock * currentAvgCost
            const totalNewValue = qty * cost
            newAvgCost = (totalOldValue + totalNewValue) / newStock

            totalValued = newStock * newAvgCost

        } else if (tipo === 'SALIDA') {
            if (currentStock < qty) {
                throw new Error(`Stock insuficiente. Stock actual: ${currentStock}`)
            }
            newStock = currentStock - qty
            // Cost remains average
            totalValued = newStock * newAvgCost
        }

        // 1. Create Movement
        const mov = await tx.movimientoInventario.create({
            data: {
                itemId,
                tipo,
                cantidad: qty,
                costoUnitario: tipo === 'INGRESO' ? cost : currentAvgCost, // If exit, use avg cost
                costoTotal: qty * (tipo === 'INGRESO' ? cost : currentAvgCost),
                motivo,
                documentoRef,
                lote,
                fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
                proveedorId: proveedorId || null,
                usuarioId: user.id
            }
        })

        // 2. Update Item Stock & Cost
        await tx.inventarioItem.update({
            where: { id: itemId },
            data: {
                stockActual: newStock,
                costoPromedio: newAvgCost
            }
        })

        // 3. Register Kardex
        await tx.kardex.create({
            data: {
                itemId,
                movimientoId: mov.id,
                tipo: tipo === 'INGRESO' ? 'ENTRADA' : 'SALIDA',
                fecha: new Date(),
                cantidad: newStock,        // Saldo Cantidad
                costoUnitario: newAvgCost, // Saldo Costo Unitario
                costoTotal: totalValued    // Saldo Valorado
            }
        })

        return mov
    })

    return result
})

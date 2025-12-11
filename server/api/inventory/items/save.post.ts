import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {
        id, codigo, nombre, descripcion, categoria, unidadMedida,
        stockMinimo, stockMaximo, precioVenta, ubicacion, proveedorId
    } = body

    if (id) {
        // Update
        return await prisma.inventarioItem.update({
            where: { id },
            data: {
                codigo, nombre, descripcion, categoria, unidadMedida,
                stockMinimo, stockMaximo, precioVenta, ubicacion, proveedorId
            }
        })
    } else {
        // Create
        return await prisma.inventarioItem.create({
            data: {
                codigo, nombre, descripcion, categoria, unidadMedida,
                stockMinimo: stockMinimo || 0,
                stockMaximo: stockMaximo || 0,
                precioVenta: precioVenta || 0,
                ubicacion,
                proveedorId: proveedorId || null,
                stockActual: 0, // Initial stock is 0, must use Movement to add
                costoPromedio: 0
            }
        })
    }
})

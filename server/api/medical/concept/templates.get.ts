
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
    const templates = await prisma.plantillaConcepto.findMany({
        where: { activo: true },
        select: { id: true, nombre: true, tipoResultado: true }
    })
    return templates
})

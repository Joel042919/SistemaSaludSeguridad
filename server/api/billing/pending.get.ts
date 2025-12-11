

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const patientId = query.patientId as string

    if (!patientId) return []

    // Buscar citas del paciente que NO tengan factura asociada y NO estén canceladas
    const citasPendientes = await prisma.cita.findMany({
        where: {
            pacienteId: patientId,
            estado: { not: 'CANCELADO' },
            factura: { is: null } // Prisma syntax for no relation
        },
        include: {
            protocolo: true
        }
    })

    const items = citasPendientes.map(cita => {
        let descripcion = 'Cita Médica'
        let precio = 0

        if (cita.protocolo) {
            descripcion = cita.protocolo.nombre
            precio = Number(cita.protocolo.precioBase)
        } else {
            // Si no hay protocolo, es una cita general o por servicio individual?
            // Por defecto asumimos un precio base o configurable
            descripcion = 'Consulta S/ Protocolo'
            precio = 50.00
        }

        return {
            id: cita.id, // Reference to Cita ID
            tipo: 'CITA',
            descripcion,
            precio,
            cantidad: 1,
            fecha: cita.fechaProgramada
        }
    })

    return items
})

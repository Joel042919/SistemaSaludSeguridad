

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const start = query.start ? new Date(query.start as string) : new Date()
    const end = query.end ? new Date(query.end as string) : new Date(new Date().setMonth(new Date().getMonth() + 1))

    const appointments = await prisma.cita.findMany({
        where: {
            fechaProgramada: {
                gte: start,
                lte: end
            }
        },
        include: {
            paciente: { select: { nombres: true, apellidos: true } },
            medico: {
                select: {
                    usuario: {
                        select: {
                            nombres: true,
                            apellidos: true
                        }
                    }
                }
            }
        }
    })

    return appointments.map(appt => ({
        id: appt.id,
        title: `${appt.paciente.nombres} (${appt.medico?.usuario?.nombres || 'Sin médico'})`,
        start: appt.fechaProgramada,
        end: new Date(new Date(appt.fechaProgramada).getTime() + 30 * 60000), // Assumed 30 min duration
        class: appt.estado === 'PENDIENTE' ? 'bg-yellow-500' :
            appt.estado === 'CONFIRMADA' ? 'bg-blue-500' :
                appt.estado === 'ATENDIDO' ? 'bg-green-500' : 'bg-gray-500'
    }))
})

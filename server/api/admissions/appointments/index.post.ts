

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log('--- APPOINTMENT CREATION DEBUG ---')
    console.log('Received Body:', body)
    const { pacienteId, medicoId, fechaProgramada, protocoloId, observaciones } = body
    const config = useRuntimeConfig()

    // 1. Validate Overlaps
    const date = new Date(fechaProgramada)
    const startDate = new Date(date.getTime() - 15 * 60000) // -15 mins
    const endDate = new Date(date.getTime() + 15 * 60000)   // +15 mins

    const overlap = await prisma.cita.findFirst({
        where: {
            medicoId,
            fechaProgramada: {
                gte: startDate,
                lte: endDate
            },
            estado: { not: 'CANCELADO' }
        }
    })

    if (overlap) {
        throw createError({ statusCode: 409, statusMessage: 'El médico ya tiene una cita en ese horario (+/- 15 min).' })
    }

    // P2003 Debugging: Validate existence
    const [patientExists, doctorExists, protocolExists] = await Promise.all([
        prisma.paciente.findUnique({ where: { id: pacienteId } }),
        prisma.medico.findUnique({ where: { id: medicoId } }),
        protocoloId ? prisma.protocolo.findUnique({ where: { id: protocoloId } }) : Promise.resolve(true)
    ])

    if (!patientExists) {
        console.error(`Patient not found: ${pacienteId}`)
        throw createError({ statusCode: 400, statusMessage: `Paciente no encontrado: ${pacienteId}` })
    }
    if (!doctorExists) {
        console.error(`Doctor not found: ${medicoId}`)
        throw createError({ statusCode: 400, statusMessage: `Médico no encontrado: ${medicoId}` })
    }
    if (!protocolExists) {
        console.error(`Protocol not found: ${protocoloId}`)
        throw createError({ statusCode: 400, statusMessage: `Protocolo no encontrado: ${protocoloId}` })
    }

    // 2. Create Appointment
    const cita = await prisma.cita.create({
        data: {
            pacienteId,
            medicoId,
            fechaProgramada: date,
            protocoloId, // Optional if null
            observaciones,
            estado: 'PENDIENTE'
        },
        include: {
            paciente: true,
            medico: {
                include: {
                    usuario: true
                }
            }
        }
    })

    // 3. N8N Integration (Fire and Forget or Await)
    const webhookUrl = process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/admission-webhook` : null

    if (webhookUrl) {
        try {
            // Non-blocking fetch if we don't await, but safer to await in serverless usually
            await $fetch(webhookUrl, {
                method: 'POST',
                body: {
                    tipo_mensaje: 'CONFIRMACION_CITA',
                    full_data: cita // Sends everything including paciente and medico relations
                }
            })
        } catch (e) {
            console.error('Error enviando webhook N8N:', e)
            // Don't fail the request if webhook fails
        }
    }

    return cita
})

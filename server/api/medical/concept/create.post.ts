import { prisma } from '../../../utils/prisma'
import { generatePdf } from '../../../utils/pdf-generator'
import { createHash } from 'crypto'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const user = event.context.user

    if (!user || user.rol !== 'MEDICO') {
        // Logic constraint: Only doctors emit concepts
    }

    const { historiaId, aptitud, restricciones, recomendaciones, plantillaId, firmaImagen } = body

    if (!historiaId || !aptitud) {
        throw createError({ statusCode: 400, statusMessage: 'Faltan datos requeridos (historiaId, aptitud)' })
    }

    // 1. Get History & Patient Data
    const historia = await prisma.historiaClinica.findUnique({
        where: { id: historiaId },
        include: {
            paciente: { include: { empresa: true } },
            cita: { include: { protocolo: true } }
        }
    })

    if (!historia) {
        throw createError({ statusCode: 404, statusMessage: 'Historia clínica no encontrada' })
    }

    const medico = await prisma.medico.findUnique({ where: { usuarioId: user.id } })
    if (!medico) {
        throw createError({ statusCode: 403, statusMessage: 'Usuario no es médico' })
    }

    // 2. Prepare Template
    let htmlContent = ''
    if (plantillaId) {
        const plantilla = await prisma.plantillaConcepto.findUnique({ where: { id: plantillaId } })
        if (plantilla) {
            htmlContent = plantilla.contenidoHtml
        }
    }

    if (!htmlContent) {
        // Fallback default template
        htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #333; }
                    .info { margin-bottom: 20px; }
                    .info p { margin: 5px 0; }
                    .result { border: 1px solid #ccc; padding: 15px; margin: 20px 0; background-color: #f9f9f9; }
                    .footer { margin-top: 50px; text-align: center; font-size: 0.8em; color: #666; }
                </style>
            </head>
            <body>
                <h1>Certificado de Aptitud Médico Ocupacional</h1>
                
                <div class="info">
                    <p><strong>Paciente:</strong> {{nombre_paciente}}</p>
                    <p><strong>DNI:</strong> {{dni}}</p>
                    <p><strong>Empresa:</strong> {{empresa}}</p>
                    <p><strong>Fecha de Evaluación:</strong> {{fecha}}</p>
                </div>

                <hr/>

                <div class="result">
                    <h2>DICTAMEN DE APTITUD: {{aptitud}}</h2>
                    {{restricciones_block}}
                    {{recomendaciones_block}}
                </div>

                <div class="footer">
                    <div>{{firma_doctor}}</div>
                    <p><i>Este documento ha sido generado y firmado digitalmente.</i></p>
                    <p>Hash de Verificación: {{hash}}</p>
                </div>
            </body>
        </html>`
    }

    // 3. Replace Variables
    const variables = {
        '{{nombre_paciente}}': `${historia.paciente.nombres} ${historia.paciente.apellidos}`,
        '{{dni}}': historia.paciente.numDoc,
        '{{empresa}}': historia.paciente.empresa?.razonSocial || 'Particular',
        '{{aptitud}}': aptitud.replace(/_/g, ' '),
        '{{restricciones_block}}': restricciones ? `<p><strong>Restricciones:</strong> ${restricciones}</p>` : '',
        '{{recomendaciones_block}}': recomendaciones ? `<p><strong>Recomendaciones:</strong> ${recomendaciones}</p>` : '',
        '{{fecha}}': new Date().toLocaleDateString(),
        '{{firma_doctor}}': firmaImagen
            ? `<img src="${firmaImagen}" style="max-height: 100px; max-width: 200px;" />`
            : (medico.firmaDigitalUrl ? `<img src="${medico.firmaDigitalUrl}" style="max-height: 100px; max-width: 200px;" />` : ''),
        '{{hash}}': 'PENDIENTE_DE_GENERACION' // Placeholder
    }

    for (const [key, val] of Object.entries(variables)) {
        htmlContent = htmlContent.replace(new RegExp(key, 'g'), val)
    }

    // 4. Generate Hash & PDF
    const hashVerificacion = createHash('sha256').update(htmlContent).digest('hex')
    htmlContent = htmlContent.replace('PENDIENTE_DE_GENERACION', hashVerificacion) // Inject real hash

    const pdfBuffer = await generatePdf(htmlContent)

    // Save PDF locally
    const fileName = `concept_${historia.id}_${Date.now()}.pdf`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'concepts')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, fileName), pdfBuffer)
    const pdfUrl = `/uploads/concepts/${fileName}`

    // 4.5. Handle Signature Logic 
    let firmaFinalUrl = medico.firmaDigitalUrl

    if (firmaImagen) {
        // Is Base64?
        const matches = firmaImagen.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches.length === 3) {
            const imageBuffer = Buffer.from(matches[2], 'base64')
            const sigFileName = `sig_${historia.id}_${Date.now()}.png`
            const sigDir = join(process.cwd(), 'public', 'uploads', 'signatures')
            await mkdir(sigDir, { recursive: true })
            await writeFile(join(sigDir, sigFileName), imageBuffer)
            firmaFinalUrl = `/uploads/signatures/${sigFileName}`
        }
    }

    // 5. Save to DB (Transaction)
    const result = await prisma.$transaction(async (tx) => {
        // Create or Update Concept
        const concepto = await tx.conceptoAptitud.upsert({
            where: { historiaId },
            update: {
                medicoId: medico.id,
                plantillaId,
                aptitud,
                restricciones,
                recomendaciones,
                firmado: true,
                hashVerificacion,
                pdfGenerado: pdfUrl,
                firmaImagenUrl: firmaFinalUrl,
                fechaEmision: new Date()
            },
            create: {
                historiaId,
                medicoId: medico.id,
                plantillaId,
                aptitud,
                restricciones,
                recomendaciones,
                firmado: true,
                hashVerificacion,
                pdfGenerado: pdfUrl,
                firmaImagenUrl: firmaFinalUrl,
                fechaEmision: new Date()
            }
        })

        // Audit
        await tx.auditoriaConcepto.create({
            data: {
                conceptoId: concepto.id,
                usuarioId: user.id,
                accion: 'EMISION'
            }
        })

        return concepto
    })

    // 6. N8N Webhook (After transaction commits)
    const webhookUrl = process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/resultado-medico-finalizado` : null

    if (webhookUrl) {
        console.log('--- TRIGGERING N8N WEBHOOK ---')
        console.log('URL:', webhookUrl)
        console.log('Payload:', { concepto_id: result.id })

        // Fire and forget (or log error without failing request)
        $fetch(webhookUrl, {
            method: 'POST',
            body: {
                concepto_id: result.id
            }
        }).then(() => {
            console.log('N8N Webhook Sent Successfully')
        }).catch(err => {
            console.error('Error sending N8N Webhook:', err)
        })
    }

    return result
})

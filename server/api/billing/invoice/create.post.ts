import { prisma } from '../../../utils/prisma'
import { generarUBL, firmarXML } from '../../../utils/sunat'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    // Sólo tesorería o admin puede facturar
    if (!user || (user.rol !== 'TESORERIA' && user.rol !== 'ADMINISTRADOR')) {
        throw createError({ statusCode: 403, statusMessage: 'Acceso denegado' })
    }

    const body = await readBody(event)
    const {
        citaId,
        clienteNombre,
        clienteDoc,
        clienteDireccion,
        tipoComprobante, // 01, 03
        items, // [{ descripcion, cantidad, precioUnitario }]
        pagos, // [{ medioPago: 'EFECTIVO', monto: 100 }]
        cajaId // Required for cash payments
    } = body

    // 1. Calcular Totales
    let subtotal = 0
    let igv = 0
    let total = 0

    const detallesData = items.map((item: any) => {
        const itemSubtotal = item.cantidad * item.precioUnitario
        subtotal += itemSubtotal
        return {
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: itemSubtotal
        }
    })

    // Simple logic: prices include IGV or add it? Let's assume prices include IGV for simplicity in retail, 
    // or add it. Standard Peru: usually Value + IGV. 
    // Let's assume input is Value (Base Imponible) + IGV. 
    // Wait, let's stick to standard: subtotal is sum of items. Total = subtotal * 1.18? 
    // Or items are tax included? Let's assume input prices include IGV.
    total = subtotal
    subtotal = total / 1.18
    igv = total - subtotal

    // 2. SUNAT Simulation
    const serie = tipoComprobante === '01' ? 'F001' : 'B001' // Simple logic
    const lastInvoice = await prisma.factura.findFirst({
        where: { serie, tipoComprobante },
        orderBy: { numero: 'desc' }
    })
    const numero = lastInvoice ? (parseInt(lastInvoice.numero) + 1).toString().padStart(8, '0') : '00000001'

    const facturaSimulada = {
        serie, numero, clienteDoc, clienteNombre, igv: igv.toFixed(2), total: total.toFixed(2)
    }

    const xml = generarUBL(facturaSimulada)
    const { xmlFirmado, hash, signatureId } = firmarXML(xml)

    // SAVE XML TO DISK
    const xmlFileName = `${serie}-${numero}.xml`
    const xmlDir = join(process.cwd(), 'public', 'uploads', 'xml')
    await mkdir(xmlDir, { recursive: true })
    await writeFile(join(xmlDir, xmlFileName), xmlFirmado)
    const xmlUrl = `/uploads/xml/${xmlFileName}`

    // SEND TO WEBHOOK (N8N)
    try {
        await fetch('https://joel042919.app.n8n.cloud/webhook-test/envio-sunat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...facturaSimulada,
                xmlBase64: Buffer.from(xmlFirmado).toString('base64'), // Send content or URL
                xmlUrl: `${process.env.BASE_URL || 'http://localhost:3000'}${xmlUrl}`
            })
        })
    } catch (e) {
        console.error('Error sending to N8N webhook:', e)
    }

    // 3. Transaction
    const result = await prisma.$transaction(async (tx) => {
        // Create Invoice
        const factura = await tx.factura.create({
            data: {
                usuarioId: user.id,
                citaId: citaId || null,
                tipoComprobante,
                serie,
                numero,
                clienteNombre,
                clienteDoc,
                clienteDireccion,
                subtotal,
                igv,
                total,
                estadoPago: 'PAGADO', // Assumed full payment for POS
                xmlGenerado: xmlUrl, // Store URL
                hashCdr: hash,
                estadoSunat: 'ENVIADO', // Initial status
                detalles: {
                    create: detallesData
                }
            }
        })

        // Process Payments & Cashbox
        for (const p of pagos) {
            const pago = await tx.pago.create({
                data: {
                    facturaId: factura.id,
                    medioPago: p.medioPago,
                    monto: p.monto,
                    referencia: p.referencia,
                    cajaId: cajaId // Link to session
                }
            })

            // If Cash, update MovimientoCaja
            if (p.medioPago === 'EFECTIVO' && cajaId) {
                await tx.movimientoCaja.create({
                    data: {
                        cajaId,
                        tipo: 'INGRESO',
                        monto: p.monto,
                        descripcion: `Venta ${serie}-${numero}`,
                        usuarioId: user.id
                    }
                })
            }
        }

        // Update Cita state if needed
        if (citaId) {
            // Logic to mark cita as paid or partially paid?
            // Since we don't have a specific "paid" boolean in Cita, maybe just creating the link is enough.
        }

        return factura
    })

    return result
})

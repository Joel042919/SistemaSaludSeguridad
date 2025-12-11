import { prisma } from '../../../../utils/prisma'

// Helper for "Amount in Words" (Simplified for MVP, usually requires a robust lib)
function numberToWords(amount: number): string {
    const ent = Math.floor(amount)
    const dec = Math.round((amount - ent) * 100)
    // Placeholder - In a real app use 'numero-a-letras' library or similar
    return `SON: ${ent} CON ${dec.toString().padStart(2, '0')}/100 SOLES`
}

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
    }

    const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
            detalles: true,
            usuario: true
        }
    })

    if (!factura) {
        throw createError({ statusCode: 404, statusMessage: 'Factura no encontrada' })
    }

    const isFactura = factura.tipoComprobante === '01'
    const clienteLabel = isFactura ? 'Razón Social' : 'Cliente'
    const docLabel = isFactura ? 'RUC' : 'DNI/Doc'

    // HTML Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; font-size: 14px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
            .company-info h1 { margin: 0; color: #1a237e; font-size: 24px; }
            .company-info p { margin: 2px 0; color: #555; }
            
            .invoice-box { border: 1px solid #aaa; padding: 15px; border-radius: 8px; text-align: center; min-width: 200px; }
            .invoice-type { font-weight: bold; font-size: 16px; display: block; margin-bottom: 5px; background: #eee; padding: 5px; }
            .invoice-number { font-size: 18px; color: #d32f2f; font-weight: bold; }

            .client-info { margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 4px; }
            .client-info table { width: 100%; border: none; margin: 0; }
            .client-info td { padding: 4px; border: none; }
            .label { font-weight: bold; width: 120px; color: #555; }

            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { background: #1a237e; color: white; padding: 10px; text-align: left; font-size: 12px; }
            .items-table td { padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; }
            
            .totals-section { float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            .total-final { font-weight: bold; font-size: 16px; border-top: 2px solid #333; margin-top: 5px; padding-top: 5px; color: #1a237e; }

            .amount-words { clear: both; margin-top: 40px; padding: 10px; background: #f5f5f5; font-style: italic; border-left: 4px solid #1a237e; }

            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>Salud Laboral S.A.C</h1>
                <p><strong>RUC: 20123456789</strong></p>
                <p>Av. Principal 123, San Borja, Lima</p>
                <p>Tel: (01) 555-0000 | Email: facturacion@saludlaboral.com</p>
            </div>
            <div class="invoice-box">
                <span class="invoice-type">${isFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}</span>
                <div class="invoice-number">${factura.serie}-${factura.numero}</div>
            </div>
        </div>

        <div class="client-info">
            <table>
                <tr>
                    <td class="label">Fecha Emisión:</td>
                    <td>${new Date(factura.fechaEmision).toLocaleDateString()} ${new Date(factura.fechaEmision).toLocaleTimeString()}</td>
                </tr>
                <tr>
                    <td class="label">${clienteLabel}:</td>
                    <td>${factura.clienteNombre}</td>
                </tr>
                <tr>
                    <td class="label">${docLabel}:</td>
                    <td>${factura.clienteDoc}</td>
                </tr>
                <tr>
                    <td class="label">Dirección:</td>
                    <td>${factura.clienteDireccion || 'No Registrada'}</td>
                </tr>
                <tr>
                    <td class="label">Moneda:</td>
                    <td>${factura.moneda}</td>
                </tr>
            </table>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Cant.</th>
                    <th>Unidad</th>
                    <th>Descripción</th>
                    <th style="text-align: right">P. Unit</th>
                    <th style="text-align: right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${factura.detalles.map(d => `
                <tr>
                    <td style="width: 50px;">${Number(d.cantidad).toFixed(2)}</td>
                    <td style="width: 60px;">U.N</td>
                    <td>${d.descripcion}</td>
                    <td style="text-align: right">${Number(d.precioUnitario).toFixed(2)}</td>
                    <td style="text-align: right">${Number(d.subtotal).toFixed(2)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-row">
                <span>Op. Gravada:</span>
                <span>S/ ${Number(factura.subtotal).toFixed(2)}</span>
            </div>
            <div class="totals-row">
                <span>IGV (18%):</span>
                <span>S/ ${Number(factura.igv).toFixed(2)}</span>
            </div>
            <div class="totals-row total-final">
                <span>IMPORTE TOTAL:</span>
                <span>S/ ${Number(factura.total).toFixed(2)}</span>
            </div>
        </div>

        <div class="amount-words">
            ${numberToWords(Number(factura.total))}
        </div>

        <div class="footer">
            <p>Representación impresa del Comprobante Electrónico, consulte en www.saludlaboral.com</p>
            <p>Generado por: ${factura.usuario.nombres} ${factura.usuario.apellidos}</p>
            <p>Hash: ${factura.hashCdr || '-'}</p>
        </div>
    </body>
    </html>
    `

    // Generate PDF using dynamic import to avoid build issues
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(htmlContent)
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } })
    await browser.close()

    // Return PDF
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${factura.serie}-${factura.numero}.pdf"`)

    return pdfBuffer
})

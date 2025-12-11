import { prisma } from '../../utils/prisma'
import ExcelJS from 'exceljs'
import { PassThrough } from 'stream'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { reportType, filters } = body

    // Create Workbook
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Reporte')

    let data: any[] = []

    if (reportType === 'FACTURAS') {
        worksheet.columns = [
            { header: 'Serie-Numero', key: 'serie' },
            { header: 'Cliente', key: 'cliente' },
            { header: 'Fecha', key: 'fecha' },
            { header: 'Total (S/)', key: 'total' },
            { header: 'Estado', key: 'estado' }
        ]

        data = await prisma.factura.findMany({
            where: {
                fechaEmision: {
                    gte: filters?.fechaInicio ? new Date(filters.fechaInicio) : undefined,
                    lte: filters?.fechaFin ? new Date(filters.fechaFin) : undefined
                }
            },
            orderBy: { fechaEmision: 'desc' }
        })

        data.forEach(d => {
            worksheet.addRow({
                serie: `${d.serie}-${d.numero}`,
                cliente: d.clienteNombre,
                fecha: d.fechaEmision.toISOString().split('T')[0],
                total: Number(d.total),
                estado: d.estadoPago
            })
        })
    } else if (reportType === 'EXAMENES') {
        // ... Logic for Exams report
        worksheet.columns = [
            { header: 'Tipo', key: 'tipo' },
            { header: 'Estado', key: 'estado' },
            { header: 'Fecha', key: 'fecha' }
        ]
        // Fetch exams...
    }

    // Set Response Headers
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    event.node.res.setHeader('Content-Disposition', `attachment; filename="reporte-${reportType.toLowerCase()}.xlsx"`)

    // Stream
    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
})


import puppeteer from 'puppeteer'

export const generatePdf = async (htmlContent: string): Promise<Buffer> => {
    let browser = null
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        })
        return Buffer.from(pdfBuffer)
    } finally {
        if (browser) await browser.close()
    }
}

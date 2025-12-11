import { createHash } from 'crypto'

export const generarUBL = (factura: any) => {
    // Simulación de estructura UBL 2.1
    // En producción esto usaría librerías como xmlbuilder2
    const xml = `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
   <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
   <cbc:CustomizationID>2.0</cbc:CustomizationID>
   <cbc:ID>${factura.serie}-${factura.numero}</cbc:ID>
   <cbc:IssueDate>${new Date().toISOString().split('T')[0]}</cbc:IssueDate>
   <cac:AccountingSupplierParty>
      <cac:Party>
         <cac:PartyIdentification>
            <cbc:ID schemeID="6">20123456789</cbc:ID>
         </cac:PartyIdentification>
         <cac:PartyLegalEntity>
            <cbc:RegistrationName>CLINICA SALUD LABORAL S.A.C.</cbc:RegistrationName>
         </cac:PartyLegalEntity>
      </cac:Party>
   </cac:AccountingSupplierParty>
   <cac:AccountingCustomerParty>
      <cac:Party>
         <cac:PartyIdentification>
            <cbc:ID schemeID="1">${factura.clienteDoc}</cbc:ID>
         </cac:PartyIdentification>
         <cac:PartyLegalEntity>
            <cbc:RegistrationName>${factura.clienteNombre}</cbc:RegistrationName>
         </cac:PartyLegalEntity>
      </cac:Party>
   </cac:AccountingCustomerParty>
   <cac:TaxTotal>
      <cbc:TaxAmount currencyID="PEN">${factura.igv}</cbc:TaxAmount>
   </cac:TaxTotal>
   <cac:LegalMonetaryTotal>
      <cbc:PayableAmount currencyID="PEN">${factura.total}</cbc:PayableAmount>
   </cac:LegalMonetaryTotal>
</Invoice>`
    return xml
}

export const firmarXML = (xml: string) => {
    // Simulación de firma digital (SHA-256)
    // En producción se usa certificados .p12 y librerias de firma XMLDSig
    const hash = createHash('sha256').update(xml).digest('hex')
    const firma = `SIGNATURE_${hash.substring(0, 20).toUpperCase()}`

    // Inyectar firma mock en el XML
    const xmlFirmado = xml.replace('</Invoice>', `<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent><ds:Signature>${firma}</ds:Signature></ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions></Invoice>`)

    return {
        xmlFirmado,
        hash: hash,
        signatureId: firma
    }
}

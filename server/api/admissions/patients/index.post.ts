

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {
        nombres, apellidos, tipoDoc, numDoc, fechaNacimiento,
        sexo, email, telefono, empresaId, fotoUrl, documentos
    } = body

    if (!nombres || !apellidos || !numDoc) {
        throw createError({ statusCode: 400, statusMessage: 'Datos requeridos faltantes' })
    }

    try {
        const patient = await prisma.paciente.create({
            data: {
                nombres,
                apellidos,
                tipoDoc,
                numDoc,
                fechaNacimiento: new Date(fechaNacimiento),
                sexo,
                email,
                telefono,
                empresa: empresaId ? { connect: { id: empresaId } } : undefined,
                fotoUrl,
                documentos
            } as any
        })
        return patient
    } catch (e: any) {
        if (e.code === 'P2002') {
            throw createError({ statusCode: 409, statusMessage: 'Ya existe un paciente con ese Documento' })
        }
        throw e
    }
})

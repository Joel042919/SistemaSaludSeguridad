
export default defineEventHandler(async (event) => {
    // Fallback because [citaId].get.ts exists in same path, causing param to be named 'citaId' sometimes
    const id = getRouterParam(event, 'id') || getRouterParam(event, 'citaId')

    const body = await readBody(event)
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }

    const { antecedentesLaborales, antecedentesPatologicos, alergias, habitosNocivos } = body

    try {
        const updated = await prisma.historiaClinica.update({
            where: { id },
            data: {
                antecedentesLaborales,
                antecedentesPatologicos,
                alergias,
                habitosNocivos
            }
        })
        return updated
    } catch (e: any) {
        console.error(e)
        throw createError({ statusCode: 500, statusMessage: 'Error updating history' })
    }
})

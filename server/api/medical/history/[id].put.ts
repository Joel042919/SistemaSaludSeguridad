
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const user = event.context.user

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
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

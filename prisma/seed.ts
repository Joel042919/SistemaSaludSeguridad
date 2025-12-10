import { PrismaClient, RolUsuario } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@saludlaboral.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            nombres: 'Admin',
            apellidos: 'Sistema',
            rol: RolUsuario.ADMINISTRADOR,
        },
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

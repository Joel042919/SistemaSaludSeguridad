import { PrismaClient, RolUsuario } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@saludlaboral.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)

    // 1. Admin (Already exists)
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

    // 2. Admission User
    const admisionUser = await prisma.usuario.upsert({
        where: { email: 'admision@saludlaboral.com' },
        update: {},
        create: {
            email: 'admision@saludlaboral.com',
            passwordHash: hashedPassword,
            nombres: 'Roberto',
            apellidos: 'Gomez',
            rol: RolUsuario.ADMISION,
        },
    })
    console.log({ admisionUser })

    // 2.5 Tesoreria User
    const tesoreriaUser = await prisma.usuario.upsert({
        where: { email: 'tesoreria@saludlaboral.pe' },
        update: {},
        create: {
            email: 'tesoreria@saludlaboral.pe',
            passwordHash: hashedPassword,
            nombres: 'Cajero',
            apellidos: 'Principal',
            rol: RolUsuario.TESORERIA,
        },
    })
    console.log({ tesoreriaUser })

    // 2.6 Logistica User
    const logisticaUser = await prisma.usuario.upsert({
        where: { email: 'logistica@saludlaboral.pe' },
        update: {},
        create: {
            email: 'logistica@saludlaboral.pe',
            passwordHash: hashedPassword,
            nombres: 'Jefe',
            apellidos: 'Logistica',
            rol: RolUsuario.LOGISTICA,
        },
    })
    console.log({ logisticaUser })

    // 3. Doctors
    const doctors = [
        { email: 'estan@saludlaboral.com', nombres: 'Esteban Andres', apellidos: 'Carranza Aguirre', cmp: '12345', especialidad: 'Medicina General' },
        { email: 'juaza@saludlaboral.com', nombres: 'Juana', apellidos: 'Zavala Del Aguila', cmp: '54321', especialidad: 'Psicologia' },
    ]

    for (const doc of doctors) {
        const u = await prisma.usuario.upsert({
            where: { email: doc.email },
            update: {},
            create: {
                email: doc.email,
                passwordHash: hashedPassword,
                nombres: doc.nombres,
                apellidos: doc.apellidos,
                rol: RolUsuario.MEDICO,
                medicoPerfil: {
                    create: {
                        cmp: doc.cmp,
                        especialidad: doc.especialidad
                    }
                }
            },
        })
        console.log(`Created doctor: ${u.email}`)
    }
    // 4. Create Protocols (Must have companies first)
    // Create a dummy company if not exists for seed
    const empresa = await prisma.empresa.upsert({
        where: { ruc: '45678932678' },
        update: {},
        create: {
            ruc: '45678932678',
            razonSocial: 'BOGA SAC'
        }
    })

    const protocolos = [
        { nombre: 'EMO Ingreso Administrativo', precioBase: 100 },
        { nombre: 'EMO Anual Operario', precioBase: 150 }
    ]

    for (const p of protocolos) {
        await prisma.protocolo.create({
            data: {
                nombre: p.nombre,
                empresaId: empresa.id,
                examenes: {}, // Empty JSON
                precioBase: p.precioBase
            }
        })
    }
    console.log('Protocols seeded')
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

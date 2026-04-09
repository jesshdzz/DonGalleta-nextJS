import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const dbUrl = new URL(process.env.DATABASE_URL as string);
const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '3306', 10),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('iniciando');

    // encriptamos la contraseña "123456"
    const hashedPassword = await bcrypt.hash('123456', 10);

    // usuario Luis 
    const luis = await prisma.user.upsert({
        where: { email: 'luis@dongalleta.com' },
        update: { password: hashedPassword },
        create: {
            name: 'Luis',
            email: 'luis@dongalleta.com',
            password: hashedPassword,
            role: 'ADMIN'
        },
    });

    // productos nuevos
    const galletachokis = await prisma.product.upsert({
        where: { slug: 'galleta-chispas' },
        update: {},
        create: {
            name: 'Galleta chokis',
            description: 'Galletas gamesa chokis.',
            price: 15.50,
            stock: 5,
            slug: 'galleta-chispas',
            isActive: true,
        },
    });

    const galletaemperador = await prisma.product.upsert({
        where: { slug: 'galleta-emperador' },
        update: {},
        create: {
            name: 'Galleta emperador',
            description: 'Galletas gamesa emperador.',
            price: 18.00,
            stock: 0,
            slug: 'galleta-emperador',
            isActive: true,
        },
    });

    // cupones 
    await prisma.coupon.deleteMany({
        where: { code: { in: ['BIENVENIDA10', 'REGALO50', 'TARDE'] } }
    });

    await prisma.coupon.createMany({
        data: [
            {
                code: 'BIENVENIDA10',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                isActive: true,
                usageLimit: 100,
            },
            {
                code: 'REGALO50',
                discountType: 'FIXED',
                discountValue: 50,
                expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                isActive: true,
            },
            {
                code: 'TARDE',
                discountType: 'PERCENTAGE',
                discountValue: 20,
                expirationDate: new Date(Date.now() - 86400000),
                isActive: true,
            }
        ]
    });

    // pedido pendiente
    const pedidosExistentes = await prisma.order.findMany({
        where: { userId: luis.id, status: 'PENDING' }
    });

    if (pedidosExistentes.length === 0) {
        await prisma.order.create({
            data: {
                userId: luis.id,
                total: 31.00,
                status: 'PENDING',
                items: {
                    create: [
                        {
                            productId: galletachokis.id,
                            quantity: 2,
                            price: 15.50,
                        }
                    ]
                }
            }
        });
    }

    console.log('datos insertados');
}

main()
    .catch((e) => {
        console.error('error al insertar datos', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
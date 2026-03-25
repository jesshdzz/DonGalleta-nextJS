'use server';

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: true,
        },
    });

    return orders.map((order) => ({
        ...order,
        total: order.total.toNumber(),
    }));
}

export async function getAdminOrderById(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!order) return null;

    return {
        ...order,
        total: order.total.toNumber(),
        items: order.items.map((item) => ({
            ...item,
            price: item.price.toNumber(),
            product: {
                ...item.product,
                price: item.product.price.toNumber(),
            },
        })),
    };
}

export async function updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
        where: { id },
        data: { status: status as OrderStatus },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${id}`);

    return {
        ...order,
        total: order.total.toNumber(),
    };
}

export async function verifyPaymentIntent(intentId: string) {
    try {
        const fetchOrderFromDb = async () => prisma.order.findFirst({
            where: { payment: { transactionId: intentId } },
            include: {
                items: { include: { product: true } }, 
                user: true 
            }
        });

        // 1. Intentamos buscar la orden directamente
        let order = await fetchOrderFromDb();

        // 2. Si no existe en la BD, tal vez el Webhook no llegó a tiempo o no hay Webhook activo (Desarrollo local).
        // Pasamos a buscar a Stripe de forma manual para sincronizar:
        if (!order) {
            console.log(`⚠️ Orden no detectada para intent ${intentId}. Verificando con Stripe directamente...`);
            
            // Cargamos dinámicamente el server action del pago y librería de Stripe 
            const paymentActions = await import('./payment-actions');
            const Stripe = await import('stripe');
            const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: "2026-02-25.clover", 
            });

            // Consultamos la API de stripe a ver si el pago es real
            const stripeIntent = await stripe.paymentIntents.retrieve(intentId);

            if (stripeIntent.status === "succeeded") {
                console.log(`✅ Stripe confirma que el pago se hizo. Procesando sincrónicamente...`);
                // Mandamos a crear la orden y descontar inventario nosotros mismos forzando el action del webhook.
                // Como processSuccessfulPayment usa prisma.$transaction y detecta si ya existe o no, es completamente seguro contra condiciones de carrera.
                await paymentActions.processSuccessfulPayment(stripeIntent.id, stripeIntent.amount, stripeIntent.metadata);
                
                // Con la orden ya creada forzosamente, la volvemos a extraer de la base de datos
                order = await fetchOrderFromDb();
            }
        }

        // 3. Verificamos por última vez
        if (!order) return { success: false, error: "No encontrada y el pago no ha sido liquidado" };

        return { 
            success: true, 
            order: {
                ...order,
                total: order.total.toNumber(),
                items: order.items.map(item => ({
                    ...item,
                    price: item.price.toNumber(),
                    product: item.product ? {
                        ...item.product,
                        price: item.product.price.toNumber(),
                    } : null
                }))
            } 
        };
    } catch (error) {
        console.error("Error validando intent:", error);
        return { success: false, error: "Error interno" };
    }
}

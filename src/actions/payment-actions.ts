'use server';

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; 
import { pusher } from "@/lib/pusher"; 
import { z } from "zod";
import { CarritoMetadataSchema } from "@/lib/validators/stripe-schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover", 
});

export async function createPaymentIntent(amount: number, cart: any[]) {
    try {
        const session = await auth();
        let userId = "";
        
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({ 
                where: { email: session.user.email }
            });
            if (user) {
                userId = user.id;
            }
        }

        const itemsSimplificados = cart.map((item: any) => ({
            id: item.productId,
            cantidad: item.quantity,
            precio: item.price 
        }));

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: "mxn", 
            automatic_payment_methods: {
                enabled: true, 
            },
            metadata: {
                userId: userId, 
                productos: JSON.stringify(itemsSimplificados)
            }
        });

        return { success: true, clientSecret: paymentIntent.client_secret };
    } catch (error: any) {
        console.error("Error al crear el PaymentIntent:", error);
        return { success: false, error: "Ocurrió un error al procesar el pago" };
    }
}

export async function processSuccessfulPayment(paymentIntentId: string, amount: number, metadata: Stripe.Metadata) {
    const productosCompradosString = metadata.productos;
    const userId = metadata.userId; 

    if (!productosCompradosString || !userId) {
        console.log('❌ Faltan metadatos esenciales en el PaymentIntent');
        return { success: false, error: "Missing metadata" };
    }

    try {
        const parsedData = JSON.parse(productosCompradosString);
        const productosValidados = CarritoMetadataSchema.parse(parsedData);
        
        await prisma.$transaction(async (tx) => {
            const existingOrder = await tx.order.findFirst({
                where: { payment: { transactionId: paymentIntentId } }
            });

            if (existingOrder) {
                console.log(`⚠️ Orden ya generada para intent ${paymentIntentId}, saltando.`);
                return;
            }

            await tx.order.create({
                data: {
                    userId: userId,
                    total: amount / 100,
                    status: "PENDING", 
                    items: {
                        create: productosValidados.map((item) => ({
                            productId: item.id,
                            quantity: item.cantidad,
                            price: item.precio
                        }))
                    },
                    payment: {
                        create: {
                            method: "STRIPE",
                            transactionId: paymentIntentId, 
                            amount: amount / 100,
                            status: "paid"
                        }
                    }
                }
            });

            for (const item of productosValidados) {
                await tx.product.update({
                    where: { id: item.id },
                    data: { stock: { decrement: item.cantidad } }
                });
            }
        });

        console.log('✅ Stock actualizado exitosamente');

        try {
            await pusher.trigger('admin-notifications', 'nuevo-pedido', {
                mensaje: 'Nuevo pedido recibido',
                timestamp: new Date().toISOString()
            });
            console.log('🔔 Notificación Pusher enviada exitosamente');
        } catch (pusherError) {
            console.error('❌ Error enviando notificación Pusher:', pusherError);
        }

        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("Error de Zod:", error.issues);
        } else {
            console.error("Error crítico en BD:", error);
        }
        return { success: false, error: "Internal Error" };
    }
}

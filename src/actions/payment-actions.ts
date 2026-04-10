'use server';

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth"; 
import { pusher } from "@/lib/pusher"; 
import { z } from "zod";
import { CarritoMetadataSchema } from "@/lib/validators/stripe-schema";
import { processMultipleStockNotifications } from "@/lib/stock-notifications";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover", 
});

type CartItem = { productId: number; quantity: number; price: number };

export async function createPaymentIntent(amount: number, cart: CartItem[]) {
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

        const itemsSimplificados = cart.map((item) => ({
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
    } catch (error: unknown) {
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
        
        // 1. Obtener información de productos ANTES de actualizar stock
        const ids = productosValidados.map(item => item.id);
        const fetchedProducts = await prisma.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, stock: true, name: true }
        });

        const productsInfo = productosValidados.map((item) => {
            const product = fetchedProducts.find(p => p.id === item.id);
            
            if (!product) {
                throw new Error(`Producto ${item.id} no encontrado`);
            }
            
            return {
                id: item.id,
                name: product.name,
                oldStock: product.stock,
                quantity: item.cantidad,
                precio: item.precio,
                // Calcular nuevo stock (lo que quedará después de la compra)
                newStock: Math.max(0, product.stock - item.cantidad)
            };
        });
        
        // 2. Procesar transacción de base de datos
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

            await Promise.all(
                productosValidados.map(item => 
                    tx.product.update({
                        where: { id: item.id },
                        data: { stock: { decrement: item.cantidad } }
                    })
                )
            );
        });

        console.log('✅ Stock actualizado exitosamente');
        
        // 3. Procesar notificaciones de stock por email DESPUÉS de actualización exitosa
        const stockNotificationData = productsInfo.map(product => ({
            productId: product.id,
            productName: product.name,
            oldStock: product.oldStock,
            newStock: product.newStock,
        }));
        
        // Enviar notificaciones de stock por email (asíncrono)
        processMultipleStockNotifications(stockNotificationData)
            .catch(error => {
                console.error('❌ Error procesando notificaciones de stock por email:', error);
            });

        // 4. Enviar notificación Pusher en tiempo real
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

            // Consultamos la API de stripe a ver si el pago es real
            const stripeIntent = await stripe.paymentIntents.retrieve(intentId);

            if (stripeIntent.status === "succeeded") {
                console.log(`✅ Stripe confirma que el pago se hizo. Procesando sincrónicamente...`);
                // Mandamos a crear la orden y descontar inventario nosotros mismos forzando el action del webhook.
                // Como processSuccessfulPayment usa prisma.$transaction y detecta si ya existe o no, es completamente seguro contra condiciones de carrera.
                await processSuccessfulPayment(stripeIntent.id, stripeIntent.amount, stripeIntent.metadata || {});
                
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
                items: order.items.map((item) => ({
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

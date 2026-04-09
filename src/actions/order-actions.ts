'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function cancelOrder(orderId: string) {
    try {
        const session = await auth();
        if (!session?.user) return { success: false, error: "Debes iniciar sesión" };

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) return { success: false, error: "Pedido no encontrado" };

        // Regla HU: Solo pedidos pendientes
        if (order.status !== "PENDING") {
            return { success: false, error: "Solo se pueden cancelar pedidos en estado pendiente" };
        }

        // timepo maximo de 1 hora 
        const unaHoraEnMs = 3600000;
        const tiempoTranscurrido = Date.now() - new Date(order.createdAt).getTime();

        if (tiempoTranscurrido > unaHoraEnMs) {
            return { success: false, error: "El tiempo límite para cancelar (1 hora) ha expirado" };
        }

        // flujo de cancelación 
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" }
            });

            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }
        });

        revalidatePath('/orders');
        return { success: true, message: "Pedido cancelado exitosamente" };
    } catch (error) {
        console.error("Error al cancelar pedido:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
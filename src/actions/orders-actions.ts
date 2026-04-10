'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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


export async function getUserOrders() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" };
        }

        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        const parsedOrders = orders.map(order => ({
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
        }));

        return { success: true, orders: parsedOrders };
    } catch (error) {
        console.error("Error obteniendo pedidos del usuario:", error);
        return { success: false, error: "Error al recuperar los pedidos" };
    }
}

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

            await Promise.all(
                order.items.map(item => 
                    tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    })
                )
            );
        });

        revalidatePath('/orders');
        return { success: true, message: "Pedido cancelado exitosamente" };
    } catch (error) {
        console.error("Error al cancelar pedido:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
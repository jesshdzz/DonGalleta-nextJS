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

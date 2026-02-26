'use server';

import { prisma } from "@/lib/prisma";

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

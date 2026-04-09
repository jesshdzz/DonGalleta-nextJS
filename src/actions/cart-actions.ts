'use server';

import { prisma } from "@/lib/prisma";

export async function validateCartStock(cartItems: { productId: number, quantity: number }[]) {
    try {
        const ids = cartItems.map(item => item.productId);

        const products = await prisma.product.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, stock: true }
        });

        const errors = cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return { id: item.productId, error: "Producto no encontrado" };

            if (product.stock < item.quantity) {
                return {
                    id: item.productId,
                    name: product.name,
                    error: `Solo quedan ${product.stock} unidades disponibles.`
                };
            }
            return null;
        }).filter((err): err is { id: number; name: string; error: string } => err !== null);

        return {
            success: errors.length === 0,
            errors
        };
    } catch (error) {
        console.error("Error validando stock:", error);
        return { success: false, error: "No se pudo verificar el inventario" };
    }
}
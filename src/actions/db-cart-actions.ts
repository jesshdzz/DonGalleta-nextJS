'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// obtener el carrito de la base de datos
export async function getDbCart() {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false, error: "No autorizado" };

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return { success: false, error: "Usuario no encontrado" };

        const cart = await prisma.cart.findUnique({
            where: { userId: user.id },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart) return { success: true, cart: [] };

        const formattedCart = cart.items.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: Number(item.product.price),
            quantity: item.quantity,
            image: item.product.image || "/placeholder-product.jpg",
            availableQuantity: item.product.stock
        }));

        return { success: true, cart: formattedCart };
    } catch (error) {
        console.error("Error obteniendo carrito DB:", error);
        return { success: false, error: "Error de servidor" };
    }
}

// sincronizar el carrito local con la base de datos
export async function syncDbCart(cartItems: { productId: number, quantity: number }[]) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false };

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return { success: false };

        await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id }
            });

            // borramos los items anteriores
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            if (cartItems.length > 0) {
                await tx.cartItem.createMany({
                    data: cartItems.map(item => ({
                        cartId: cart.id,
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error sincronizando carrito DB:", error);
        return { success: false };
    }
}

// limpiar carrito de la base de datos
export async function clearDbCart() {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false };

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return { success: false };

        const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
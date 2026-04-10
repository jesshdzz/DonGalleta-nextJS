"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- VERIFICAR STOCK ---
export async function checkStock(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });
  return product ? product.stock : 0;
}

// --- CHECKOUT (Actualizar Stock) ---
export async function checkout(
  items: { productId: number; quantity: number }[],
) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("[AUTH-CHECKOUT] No valid session found. Blocking guest checkout.");
      return { success: false, message: "Regístrate para procesar tu carrito.", isAuthError: true };
    }
    console.log(`[AUTH-CHECKOUT] Session valid for user: ${session.user.email || session.user.id}`);

    // Realizar transacción con bloqueo de lecturas para inventario (evita race conditions)
    await prisma.$transaction(async (tx) => {
      const ids = items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, stock: true }
      });

      // Validar stock
      for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ID ${item.productId}`);
        }
      }

      // Actualizar stock de todos en paralelo
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");

    return { success: true, message: "Compra realizada con éxito" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Stock insuficiente")) {
      return { success: false, message: error.message };
    }
    console.error("Error en checkout:", error);
    return { success: false, message: "Error al procesar la compra" };
  }
}

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

export async function getCart() {
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
export async function syncCart(cartItems: { productId: number, quantity: number }[]) {
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
export async function clearCart() {
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
  } catch {
    return { success: false };
  }
}
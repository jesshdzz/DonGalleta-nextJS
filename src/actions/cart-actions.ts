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

    // Verificar stock de todos primero
    for (const item of items) {
      const currentStock = await checkStock(item.productId);
      if (currentStock < item.quantity) {
        return {
          success: false,
          message: `Stock insuficiente para el producto ID ${item.productId}`,
        };
      }
    }

    // Realizar transacción
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    revalidatePath("/admin/productos");
    revalidatePath("/productos");

    return { success: true, message: "Compra realizada con éxito" };
  } catch (error) {
    console.error("Error en checkout:", error);
    return { success: false, message: "Error al procesar la compra" };
  }
}

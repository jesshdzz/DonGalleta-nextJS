"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendRestockAlert } from "@/lib/email";

/**
 * Suscribe al usuario autenticado a la lista de espera de un producto agotado
 */
export async function subscribeToRestock(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión para recibir notificaciones" };
    }

    // Verificar que el producto existe y está agotado
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    if (product.stock > 0) {
      return { success: false, error: "Este producto tiene stock disponible" };
    }

    // Crear suscripción (ignorar si ya existe por el constraint único)
    await prisma.waitingList.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        productId: productId
      }
    });

    revalidatePath(`/productos/${productId}`);
    
    return { success: true, message: "Te avisaremos cuando el producto esté disponible" };
  } catch (error) {
    console.error("Error al suscribirse a lista de espera:", error);
    return { success: false, error: "Error al procesar la suscripción" };
  }
}

/**
 * Elimina la suscripción del usuario a la lista de espera de un producto
 */
export async function unsubscribeFromRestock(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión" };
    }

    await prisma.waitingList.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    revalidatePath(`/productos/${productId}`);
    
    return { success: true, message: "Ya no recibirás notificaciones de este producto" };
  } catch (error) {
    console.error("Error al desuscribirse de lista de espera:", error);
    return { success: false, error: "Error al procesar la solicitud" };
  }
}

/**
 * Verifica si el usuario actual está suscrito a la lista de espera de un producto
 */
export async function checkSubscription(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { isSubscribed: false };
    }

    const subscription = await prisma.waitingList.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    return { isSubscribed: !!subscription };
  } catch (error) {
    console.error("Error al verificar suscripción:", error);
    return { isSubscribed: false };
  }
}

/**
 * Obtiene la lista de espera de un producto (solo para admins)
 */
export async function getWaitingListByProduct(productId: number) {
  try {
    const session = await auth();
    
    // @ts-expect-error - Types for NextAuth will be extended later
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "No autorizado" };
    }

    const waitingList = await prisma.waitingList.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return { success: true, data: waitingList };
  } catch (error) {
    console.error("Error al obtener lista de espera:", error);
    return { success: false, error: "Error al obtener la lista" };
  }
}

/**
 * Notifica a todos los usuarios en lista de espera cuando un producto se reabastecer
 */
export async function notifyWaitingList(productId: number) {
  try {
    console.log(`[WaitingList] Procesando notificaciones para producto ${productId}`);

    // Obtener producto con detalles
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.stock === 0) {
      console.log(`[WaitingList] Producto ${productId} no tiene stock o no existe`);
      return;
    }

    // Obtener lista de suscriptores
    const subscribers = await prisma.waitingList.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (subscribers.length === 0) {
      console.log(`[WaitingList] No hay suscriptores para producto ${productId}`);
      return;
    }

    console.log(`[WaitingList] Enviando ${subscribers.length} notificaciones para producto ${productId}`);

    // Enviar emails y eliminar suscripciones solo si el email fue exitoso
    const emailResults = await Promise.allSettled(
      subscribers.map(async (subscriber) => {
        try {
          if (!subscriber.user.email) {
            console.log(`[WaitingList] Usuario ${subscriber.userId} sin email - no se elimina suscripción`);
            return { success: false, subscriberId: subscriber.id };
          }

          await sendRestockAlert({
            userEmail: subscriber.user.email,
            userName: subscriber.user.name || "Cliente",
            productName: product.name,
            productId: product.id,
            currentStock: product.stock,
            price: product.price.toString()
          });

          console.log(`[WaitingList] Email enviado exitosamente a ${subscriber.user.email}`);
          
          // Eliminar suscripción solo si el email se envió correctamente
          await prisma.waitingList.delete({
            where: { id: subscriber.id }
          });
          
          console.log(`[WaitingList] Suscripción eliminada para usuario ${subscriber.userId}`);
          
          return { success: true, subscriberId: subscriber.id };
        } catch (emailError) {
          console.error(`[WaitingList] Error enviando email a ${subscriber.user.email}:`, emailError);
          console.log(`[WaitingList] Suscripción mantenida para usuario ${subscriber.userId} debido a fallo en email`);
          return { success: false, subscriberId: subscriber.id };
        }
      })
    );

    // Resumen de resultados
    const successful = emailResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = emailResults.length - successful;
    
    console.log(`[WaitingList] Resumen producto ${productId}: ${successful} notificaciones exitosas, ${failed} fallos`);
  } catch (error) {
    console.error(`[WaitingList] Error procesando notificaciones para producto ${productId}:`, error);
  }
}

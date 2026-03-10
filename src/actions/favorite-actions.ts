"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Añade un producto a favoritos del usuario autenticado
 */
export async function addToFavorites(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Debes iniciar sesión para añadir favoritos" };
    }

    // Verificar que el producto existe y está activo
    const product = await prisma.product.findFirst({
      where: { 
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      return { error: "Producto no encontrado" };
    }

    // Verificar si ya está en favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    if (existingFavorite) {
      return { error: "El producto ya está en tus favoritos" };
    }

    // Crear el favorito
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        productId: productId
      }
    });

    // Revalidar páginas relevantes
    revalidatePath("/productos");
    revalidatePath("/favoritos");
    revalidatePath(`/productos/${productId}`);

    return { success: true, favorite };
  } catch (error) {
    console.error("Error añadiendo a favoritos:", error);
    return { error: "Error interno del servidor" };
  }
}

/**
 * Elimina un producto de favoritos del usuario autenticado
 */
export async function removeFromFavorites(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Debes iniciar sesión para gestionar favoritos" };
    }

    // Buscar y eliminar el favorito
    const deleted = await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId
      }
    });

    if (deleted.count === 0) {
      return { error: "El producto no estaba en favoritos" };
    }

    // Revalidar páginas relevantes
    revalidatePath("/productos");
    revalidatePath("/favoritos");
    revalidatePath(`/productos/${productId}`);

    return { success: true };
  } catch (error) {
    console.error("Error eliminando de favoritos:", error);
    return { error: "Error interno del servidor" };
  }
}

/**
 * Alterna el estado de favorito de un producto (add/remove)
 */
export async function toggleFavorite(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Debes iniciar sesión para gestionar favoritos" };
    }

    // Verificar si ya está en favoritos
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    if (existingFavorite) {
      // Si existe, eliminarlo
      return await removeFromFavorites(productId);
    } else {
      // Si no existe, añadirlo
      return await addToFavorites(productId);
    }
  } catch (error) {
    console.error("Error toggling favorito:", error);
    return { error: "Error interno del servidor" };
  }
}

/**
 * Obtiene todos los favoritos del usuario autenticado
 */
export async function getUserFavorites() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Debes iniciar sesión para ver favoritos" };
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        product: {
          include: {
            flavors: {
              include: {
                flavor: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, favorites };
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return { error: "Error interno del servidor" };
  }
}

/**
 * Obtiene los IDs de productos favoritos del usuario (más eficiente para listas)
 */
export async function getUserFavoriteIds() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { favoriteIds: [] };
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        productId: true
      }
    });

    const favoriteIds = favorites.map(fav => fav.productId);
    return { favoriteIds };
  } catch (error) {
    console.error("Error obteniendo IDs de favoritos:", error);
    return { favoriteIds: [] };
  }
}

/**
 * Verifica si un producto específico está en favoritos del usuario
 */
export async function isFavorite(productId: number) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { isFavorite: false };
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId
        }
      }
    });

    return { isFavorite: !!favorite };
  } catch (error) {
    console.error("Error verificando favorito:", error);
    return { isFavorite: false };
  }
}
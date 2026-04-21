"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getUserFavoriteStores() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const favorites = await prisma.favoriteStore.findMany({
      where: { userId: session.user.id },
      include: {
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, favorites };
  } catch (error) {
    console.error("Error fetching favorite stores:", error);
    return { success: false, error: "Error al obtener sucursales favoritas" };
  }
}

export async function toggleFavoriteStore(storeId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const existing = await prisma.favoriteStore.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId,
        },
      },
    });

    if (existing) {
      await prisma.favoriteStore.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.favoriteStore.create({
        data: {
          userId: session.user.id,
          storeId,
        },
      });
    }

    revalidatePath("/perfil");
    return { success: true, isFavorite: !existing };
  } catch (error) {
    console.error("Error toggling favorite store:", error);
    return { success: false, error: "Error al actualizar sucursal favorita" };
  }
}

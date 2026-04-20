"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: number, rating: number, comment?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión para calificar este producto." };
    }

    const userId = session.user.id;

    if (rating < 1 || rating > 5) {
      return { success: false, error: "La calificación debe estar entre 1 y 5." };
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment }
      });
    } else {
      await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          comment
        }
      });
    }

    revalidatePath(`/productos/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar la calificación:", error);
    return { success: false, error: "Hubo un problema al guardar tu calificación." };
  }
}

export async function getUserReview(productId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const review = await prisma.review.findFirst({
      where: { userId: session.user.id, productId }
    });
    return review;
  } catch (error) {
    console.error("Error al obtener la calificación:", error);
    return null;
  }
}

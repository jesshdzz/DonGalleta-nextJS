'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { promotionSchema } from "@/lib/validators/promotion-schema";

// --- OBTENER PROMOCIONES ---
export async function getAllPromotions() {
    const promotions = await prisma.promotion.findMany({
        orderBy: { id: "desc" }, // Las más nuevas primero
        include: {
            products: {
                include: {
                    product: true,
                },
            },
        },
    });
    return promotions.map((p) => ({
        ...p,
        value: p.value.toNumber(),
        minAmount: p.minAmount.toNumber(),
        maxDiscount: p.maxDiscount.toNumber(),
    }));
}

// --- CREAR / ACTUALIZAR PROMOCIÓN ---
export async function upsertPromotion(id: number | undefined, formData: FormData) {
    const raw = {
        name: formData.get("name"),
        type: formData.get("type"),
        value: formData.get("value"),
        minAmount: formData.get("minAmount"),
        maxDiscount: formData.get("maxDiscount"),
        startDate: formData.get("startDate"),
        expirationDate: formData.get("expirationDate"),
        isActive: formData.get("isActive") === "true",
        products: JSON.parse((formData.get("products") as string) || "[]"),
    };

    const parsed = promotionSchema.safeParse(raw);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
        return { success: false, message: "Error de validación", errors };
    }

    const { products, ...data } = parsed.data;

    try {
        await prisma.$transaction(async (tx) => {
            const promotion = await tx.promotion.upsert({
                where: { id: id ?? 0 },
                create: data,
                update: data,
            });

            // Sincronizar productos asociados
            await tx.promotionProduct.deleteMany({ where: { promotionId: promotion.id } });

            if (products && products.length > 0) {
                await tx.promotionProduct.createMany({
                    data: products.map((productId) => ({
                        promotionId: promotion.id,
                        productId,
                    })),
                });
            }
        });

        revalidatePath("/admin/promociones");
        return { success: true, message: id ? "Promoción actualizada." : "Promoción creada." };
    } catch (error) {
        console.error("upsertPromotion error:", error);
        return { success: false, message: "Error al guardar la promoción." };
    }
}
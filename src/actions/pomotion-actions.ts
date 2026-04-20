'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
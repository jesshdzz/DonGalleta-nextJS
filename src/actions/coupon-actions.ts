"use server";

import { prisma } from "@/lib/prisma";

export async function validateCoupon(code: string) {
    try {
        // Buscamos el cupón en la base de datos (asegurando coincidencia por mayúsculas)
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return { success: false, error: "El cupón no existe." };
        }
        if (!coupon.isActive) {
            return { success: false, error: "El cupón ya no está activo." };
        }
        if (coupon.expirationDate && coupon.expirationDate < new Date()) {
            return { success: false, error: "El cupón ha expirado." };
        }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return { success: false, error: "El límite de uso de este cupón se ha agotado." };
        }

        return {
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountType: coupon.discountType as "PERCENTAGE" | "FIXED",
                discountValue: Number(coupon.discountValue)
            }
        };
    } catch (error) {
        console.error("Error validando cupón:", error);
        return { success: false, error: "Error al validar el cupón." };
    }
}
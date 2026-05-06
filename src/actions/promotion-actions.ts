'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { promotionSchema, type PromotionFormValues } from "@/lib/validators/promotion-schema";

// ── Auth guard ─────────────────────────────────────────────────────────────────
async function requireAdmin() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN") throw new Error("No autorizado");
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function toNumber(v: unknown): number | null {
    if (v === undefined || v === null) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
}

function serializePromotion<T extends {
    value: { toNumber(): number };
    minOrderAmount: { toNumber(): number } | null;
    maxDiscountCap: { toNumber(): number } | null;
}>(p: T) {
    return {
        ...p,
        value: p.value.toNumber(),
        minOrderAmount: p.minOrderAmount?.toNumber() ?? null,
        maxDiscountCap: p.maxDiscountCap?.toNumber() ?? null,
    };
}

// ── Read operations ────────────────────────────────────────────────────────────

export async function getAllPromotions() {
    const promotions = await prisma.promotion.findMany({
        orderBy: { id: "desc" },
        include: {
            products: { include: { product: { select: { id: true, name: true } } } },
        },
    });
    return promotions.map(serializePromotion);
}

export async function getAdminPromotions(params?: { page?: number; pageSize?: number }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [total, promotions] = await Promise.all([
        prisma.promotion.count(),
        prisma.promotion.findMany({
            orderBy: { id: "desc" },
            skip,
            take: pageSize,
            include: {
                products: { include: { product: { select: { id: true, name: true } } } },
            },
        })
    ]);

    return {
        promotions: promotions.map(serializePromotion),
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        totalItems: total,
    };
}

export async function getActivePromotions() {
    await updatePromotionStatus();
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
        where: {
            isActive: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
        },
        orderBy: { createdAt: "desc" },
        include: {
            products: { include: { product: { select: { id: true, name: true } } } },
        },
    });
    return promotions.map(serializePromotion);
}

export async function getPromotionsForProduct(productId: number) {
    if (!Number.isInteger(productId) || productId <= 0) return [];

    await updatePromotionStatus();
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
        where: {
            isActive: true,
            startDate: { lte: now },
            expirationDate: { gte: now },
            OR: [
                { products: { none: {} } },              // globales
                { products: { some: { productId } } },   // específicas al producto
            ],
        },
    });
    return promotions.map(serializePromotion);
}

/** Retorna los IDs de productos con promoción activa.
 *  Si existe una promoción global (sin productos), devuelve `{ hasGlobal: true, ids: Set() }`
 *  para que el catálogo pueda marcar todos los productos. */
export async function getProductIdsWithActivePromotion() {
    await updatePromotionStatus();
    const now = new Date();

    const [promotionProducts, globalPromoCount] = await Promise.all([
        prisma.promotionProduct.findMany({
            where: {
                promotion: {
                    isActive: true,
                    startDate: { lte: now },
                    expirationDate: { gte: now },
                },
            },
            select: { productId: true },
        }),
        prisma.promotion.count({
            where: {
                isActive: true,
                startDate: { lte: now },
                expirationDate: { gte: now },
                products: { none: {} },
            },
        }),
    ]);

    return {
        hasGlobal: globalPromoCount > 0,
        ids: new Set(promotionProducts.map((pp) => pp.productId)),
    };
}

export async function getPromotionById(id: number) {
    return await prisma.promotion.findUnique({
        where: { id },
        include: {
            products: { include: { product: { select: { id: true, name: true } } } },
        },
    });
}

// ── Actualizar estado automático por vigencia ────────────────────────────

export async function updatePromotionStatus() {
    const now = new Date();

    await prisma.$transaction([
        prisma.promotion.updateMany({
            where: {
                isActive: true,
                expirationDate: { lt: now },
            },
            data: { isActive: false },
        }),
        prisma.promotion.updateMany({
            where: {
                isActive: false,
                startDate: { lte: now },
                expirationDate: { gt: now },
            },
            data: { isActive: true },
        }),
    ]);

    revalidatePath("/admin/promociones");
    revalidatePath("/");
}

// ── Write operations ───────────────────────────────────────────────────────────

export async function upsertPromotion(id: number | undefined, formData: FormData) {
    // 1. Auth
    try {
        await requireAdmin();
    } catch {
        return { success: false as const, message: "No autorizado" };
    }

    // 2. Parse seguro del JSON de productos
    let rawProducts: unknown;
    try {
        rawProducts = JSON.parse((formData.get("products") as string | null) ?? "[]");
    } catch {
        return { success: false as const, message: "Lista de productos inválida" };
    }

    // 3. Construir el objeto raw para validar
    const raw = {
        name: formData.get("name"),
        type: formData.get("type"),
        value: formData.get("value"),
        minOrderAmount: formData.get("minOrderAmount") || null,
        maxDiscountCap: formData.get("maxDiscountCap") || null,
        buyQuantity: formData.get("buyQuantity") || null,
        getQuantity: formData.get("getQuantity") || null,
        startDate: formData.get("startDate"),
        expirationDate: formData.get("expirationDate"),
        isActive: formData.get("isActive") === "true",
        products: rawProducts,
    };

    // 4. Validar con el discriminated union
    const parsed = promotionSchema.safeParse(raw);

    if (!parsed.success) {
        const errors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const path = issue.path.join(".") || "_";
            if (!errors[path]) errors[path] = [];
            errors[path].push(issue.message);
        }
        return { success: false as const, message: "Error de validación", errors };
    }

    const { products, ...data } = parsed.data as PromotionFormValues & { products?: number[] };

    // 5. Normalizar los campos opcionales por tipo (limpiar lo que no aplica)
    const promotionData = {
        name: data.name,
        type: data.type,
        value: data.type === "BUY_X_GET_Y" ? 0 : (data as { value: number }).value,
        minOrderAmount: data.type === "BUY_X_GET_Y" ? null : toNumber((data as { minOrderAmount?: number | null }).minOrderAmount),
        maxDiscountCap: data.type === "PERCENTAGE" ? toNumber((data as { maxDiscountCap?: number | null }).maxDiscountCap) : null,
        buyQuantity: data.type === "BUY_X_GET_Y" ? (data as { buyQuantity: number }).buyQuantity : null,
        getQuantity: data.type === "BUY_X_GET_Y" ? (data as { getQuantity: number }).getQuantity : null,
        startDate: data.startDate,
        expirationDate: data.expirationDate,
        isActive: data.isActive,
    };

    // 6. Validar IDs de productos contra la BD (evitar relaciones a productos inexistentes)
    if (products && products.length > 0) {
        const validProducts = await prisma.product.count({
            where: { id: { in: products }, isActive: true },
        });
        if (validProducts !== products.length) {
            return { success: false as const, message: "Uno o más productos seleccionados no son válidos" };
        }
    }

    // 7. Persistir
    try {
        await prisma.$transaction(async (tx) => {
            const promotion = id
                ? await tx.promotion.update({ where: { id }, data: promotionData })
                : await tx.promotion.create({ data: promotionData });

            await tx.promotionProduct.deleteMany({ where: { promotionId: promotion.id } });

            if (products && products.length > 0) {
                await tx.promotionProduct.createMany({
                    data: products.map((productId) => ({ promotionId: promotion.id, productId })),
                });
            }
        });

        revalidatePath("/admin/promociones");
        revalidatePath("/");
        return { success: true as const, message: id ? "Promoción actualizada." : "Promoción creada." };
    } catch (error) {
        console.error("upsertPromotion error:", error);
        return { success: false as const, message: "Error al guardar la promoción. Verifica los datos e intenta de nuevo." };
    }
}

export async function deletePromotion(id: number) {
    try {
        await requireAdmin();
    } catch {
        return { success: false as const, message: "No autorizado" };
    }

    if (!Number.isInteger(id) || id <= 0) {
        return { success: false as const, message: "ID inválido" };
    }

    try {
        await prisma.promotion.delete({ where: { id } });
        revalidatePath("/admin/promociones");
        revalidatePath("/");
        return { success: true as const, message: "Promoción eliminada." };
    } catch {
        return { success: false as const, message: "No se pudo eliminar la promoción." };
    }
}
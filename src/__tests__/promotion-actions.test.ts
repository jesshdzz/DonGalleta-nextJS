import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        promotion: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
        },
        promotionProduct: {
            findMany: vi.fn(),
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
        product: {
            count: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('HU-53: Combos y descuentos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('HU-53: getAllPromotions', () => {
        it('HU-53: debería retornar promociones serializadas', async () => {
            const mockPromos = [
                {
                    id: 1,
                    value: { toNumber: () => 10 },
                    minOrderAmount: { toNumber: () => 50 },
                    maxDiscountCap: null,
                    products: []
                }
            ];
            vi.mocked(prisma.promotion.findMany).mockResolvedValue(mockPromos as any);

            const { getAllPromotions } = await import('../actions/promotion-actions');
            const result = await getAllPromotions();

            expect(result[0].value).toBe(10);
            expect(result[0].minOrderAmount).toBe(50);
            expect(prisma.promotion.findMany).toHaveBeenCalled();
        });
    });

    describe('HU-53: getActivePromotions', () => {
        it('HU-53: debería retornar solo promociones activas', async () => {
            const now = new Date();
            vi.mocked(prisma.promotion.findMany).mockResolvedValue([]);

            const { getActivePromotions } = await import('../actions/promotion-actions');
            await getActivePromotions();

            expect(prisma.promotion.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ isActive: true })
            }));
        });
    });

    describe('HU-53: getPromotionsForProduct', () => {
        it('HU-53: debería filtrar por ID de producto y fecha', async () => {
            vi.mocked(prisma.promotion.findMany).mockResolvedValue([]);

            const { getPromotionsForProduct } = await import('../actions/promotion-actions');
            await getPromotionsForProduct(123);

            expect(prisma.promotion.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    isActive: true,
                    OR: expect.arrayContaining([
                        { products: { none: {} } },
                        { products: { some: { productId: 123 } } }
                    ])
                })
            }));
        });

        it('HU-53: debería retornar vacío para IDs inválidos', async () => {
            const { getPromotionsForProduct } = await import('../actions/promotion-actions');
            const result = await getPromotionsForProduct(-1);
            expect(result).toEqual([]);
            expect(prisma.promotion.findMany).not.toHaveBeenCalled();
        });
    });

    describe('HU-53: getProductIdsWithActivePromotion', () => {
        it('HU-53: debería identificar si hay promociones globales', async () => {
            vi.mocked(prisma.promotionProduct.findMany).mockResolvedValue([{ productId: 1 }, { productId: 2 }] as any);
            vi.mocked(prisma.promotion.count).mockResolvedValue(1);

            const { getProductIdsWithActivePromotion } = await import('../actions/promotion-actions');
            const result = await getProductIdsWithActivePromotion();

            expect(result.hasGlobal).toBe(true);
            expect(result.ids.has(1)).toBe(true);
            expect(result.ids.has(2)).toBe(true);
        });
    });

    describe('HU-53: getPromotionById', () => {
        it('HU-53: debería buscar una promoción por su ID', async () => {
            vi.mocked(prisma.promotion.findUnique).mockResolvedValue({ id: 1 } as any);

            const { getPromotionById } = await import('../actions/promotion-actions');
            const result = await getPromotionById(1);

            expect(result?.id).toBe(1);
            expect(prisma.promotion.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 1 }
            }));
        });
    });

    describe('HU-53: requireAdmin guard', () => {
        it('HU-53: debería fallar si no es ADMIN en upsertPromotion', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { role: 'USER' } } as any);

            const { upsertPromotion } = await import('../actions/promotion-actions');
            const formData = new FormData();
            const result = await upsertPromotion(undefined, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('No autorizado');
        });
    });

    describe('HU-53: upsertPromotion', () => {
        it('HU-53: debería crear una promoción exitosamente', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { role: 'ADMIN' } } as any);
            vi.mocked(prisma.product.count).mockResolvedValue(1);
            vi.mocked(prisma.promotion.create).mockResolvedValue({ id: 10 } as any);

            const formData = new FormData();
            formData.append('name', 'Promo Test');
            formData.append('type', 'PERCENTAGE');
            formData.append('value', '15');
            formData.append('startDate', '2025-01-01');
            formData.append('expirationDate', '2025-12-31');
            formData.append('isActive', 'true');
            formData.append('products', JSON.stringify([1]));

            const { upsertPromotion } = await import('../actions/promotion-actions');
            const result = await upsertPromotion(undefined, formData);

            expect(result.success).toBe(true);
            expect(prisma.promotion.create).toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/admin/promociones');
        });

        it('HU-53: debería fallar con datos inválidos (Zod)', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { role: 'ADMIN' } } as any);

            const formData = new FormData();
            formData.append('name', 'Ab'); // Muy corto
            formData.append('type', 'PERCENTAGE');

            const { upsertPromotion } = await import('../actions/promotion-actions');
            const result = await upsertPromotion(undefined, formData);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Error de validación');
            expect(result.errors).toBeDefined();
        });
    });

    describe('HU-53: deletePromotion', () => {
        it('HU-53: debería eliminar una promoción si es ADMIN', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { role: 'ADMIN' } } as any);

            const { deletePromotion } = await import('../actions/promotion-actions');
            const result = await deletePromotion(1);

            expect(result.success).toBe(true);
            expect(prisma.promotion.delete).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('HU-53: debería fallar si no es ADMIN', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { role: 'USER' } } as any);

            const { deletePromotion } = await import('../actions/promotion-actions');
            const result = await deletePromotion(1);

            expect(result.success).toBe(false);
            expect(result.message).toBe('No autorizado');
        });
    });
});

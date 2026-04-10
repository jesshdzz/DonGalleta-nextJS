import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        product: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

vi.mock('@/auth', () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: '123' } }),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('checkStock', () => {
    it('debería retornar el stock correcto', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue({ stock: 15 } as never);
        const { checkStock } = await import('../actions/cart-actions');
        const stock = await checkStock(1);
        expect(stock).toBe(15);
    });

    it('debería retornar 0 si el producto no se encuentra', async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
        const { checkStock } = await import('../actions/cart-actions');
        const stock = await checkStock(999);
        expect(stock).toBe(0);
    });
});

describe('checkout', () => {
    it('debería retornar isAuthError si no hay sesión', async () => {
        const { auth } = await import('@/auth');
        vi.mocked(auth).mockResolvedValueOnce(null as never);
        const { checkout } = await import('../actions/cart-actions');
        const result = await checkout([{ productId: 1, quantity: 1 }]);
        expect(result.success).toBe(false);
        expect(result).toHaveProperty('isAuthError', true);
    });

    it('debería fallar si el stock es insuficiente', async () => {
        // Mock checkout behavior (findMany)
        vi.mocked(prisma.product.findMany).mockResolvedValue([{ id: 1, stock: 1 }] as never);

        const { checkout } = await import('../actions/cart-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Stock insuficiente');
    });

    it('debería tener éxito y actualizar el stock', async () => {
        vi.mocked(prisma.product.findMany).mockResolvedValue([{ id: 1, stock: 100 }] as never);

        const { checkout } = await import('../actions/cart-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(true);
        expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('debería manejar errores durante el checkout', async () => {
        vi.mocked(prisma.product.findMany).mockResolvedValue([{ id: 1, stock: 100 }] as never);
        vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('Tx Failed'));

        const { checkout } = await import('../actions/cart-actions');
        const result = await checkout([{ productId: 1, quantity: 5 }]);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Error al procesar la compra');
    });
});

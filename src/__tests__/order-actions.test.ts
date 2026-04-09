import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cancelOrder } from '../actions/order-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: { findUnique: vi.fn(), update: vi.fn() },
        product: { update: vi.fn() },
        $transaction: vi.fn((cb) => cb(prisma)),
    }
}));

vi.mock('@/auth', () => ({ auth: vi.fn() }));

describe('Order Actions: HU-35 Cancelación', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('debe denegar la cancelación si pasaron más de 60 minutos', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any);

        // simulamos orden creada hace 61 minutos
        const fechaAntigua = new Date(Date.now() - 61 * 60000);

        vi.mocked(prisma.order.findUnique).mockResolvedValue({
            id: '1',
            status: 'PENDING',
            createdAt: fechaAntigua,
            items: []
        } as any);

        const result = await cancelOrder('1');
        expect(result.success).toBe(false);
        expect(result.error).toBe("El tiempo límite para cancelar (1 hora) ha expirado");
    });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateOrderStatus, getUserOrders } from '../actions/orders-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            update: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

describe('Orders Actions Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('HU-20: Cambiar el estado de un pedido', () => {
        it('HU-20: Debería actualizar el estado del pedido', async () => {
            const orderId = 'order-123';
            const newStatus = 'COMPLETED';
            const mockUpdatedOrder = {
                id: orderId,
                status: newStatus,
                total: { toNumber: () => 150.50 }
            };

            vi.mocked(prisma.order.update).mockResolvedValue(mockUpdatedOrder as any);

            const result = await updateOrderStatus(orderId, newStatus);

            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: orderId },
                data: { status: newStatus },
            });

            // Verifica que se revalidaron las rutas correctas para actualizar la UI
            expect(revalidatePath).toHaveBeenCalledWith("/admin/pedidos");
            expect(revalidatePath).toHaveBeenCalledWith(`/admin/pedidos/${orderId}`);

            // Verifica la serialización correcta
            expect(result.id).toBe(orderId);
            expect(result.status).toBe(newStatus);
            expect(result.total).toBe(150.50);
        });
    });

    describe('HU-61: Código de verificación para entrega', () => {
        it('HU-61debe retornar los pedidos del usuario incluyendo el pickupCode', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { id: 'user-123' } } as any);

            const mockOrders = [
                {
                    id: 'order-1',
                    total: { toNumber: () => 100 },
                    pickupCode: 'CODE123',
                    items: [
                        { price: { toNumber: () => 50 }, product: { price: { toNumber: () => 50 } } }
                    ]
                },
                {
                    id: 'order-2',
                    total: { toNumber: () => 200 },
                    pickupCode: null,
                    items: []
                }
            ];

            vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);

            const result = await getUserOrders();

            expect(result.success).toBe(true);
            expect(result.orders?.[0].pickupCode).toBe('CODE123');
            expect(result.orders?.[1].pickupCode).toBe(null);
            expect(prisma.order.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });
        });
    });
});


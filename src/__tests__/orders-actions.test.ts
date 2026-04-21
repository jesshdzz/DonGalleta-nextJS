import { describe, it, expect, vi } from 'vitest';
import { updateOrderStatus } from '../actions/orders-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            update: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

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


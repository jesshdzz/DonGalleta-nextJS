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

import { verifyPaymentIntent } from '../actions/orders-actions';

vi.mock('stripe', () => ({
    default: function() {
        return {
            paymentIntents: {
                retrieve: vi.fn().mockResolvedValue({ status: 'requires_payment' })
            }
        }
    }
}));

vi.mock('../actions/payment-actions', () => ({
    processSuccessfulPayment: vi.fn(),
    createPaymentIntent: vi.fn()
}));

describe('Orders Architecture Refactor: verifyPaymentIntent', () => {
    it('debe regresar la orden parseada si existe el intention ID directamente en la BD', async () => {
        const mockOrder = {
            id: 'ord-123',
            total: { toNumber: () => 200.50 },
            items: [
                { price: { toNumber: () => 100 }, product: { price: { toNumber: () => 100 } } }
            ]
        };
        vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder as any);

        const result = await verifyPaymentIntent('pi_yes');
        
        expect(result.success).toBe(true);
        expect(result.order?.total).toBe(200.50);
        expect(result.order?.items[0].price).toBe(100);
    });

    it('debe buscar en Stripe de refilón si no existe, y regresar error si stripe dice que el pago falló', async () => {
        vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

        const result = await verifyPaymentIntent('pi_no');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('No encontrada y el pago no ha sido liquidado');
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPaymentIntent, processSuccessfulPayment } from '../actions/payment-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { pusher } from '@/lib/pusher';
import Stripe from 'stripe';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    order: { 
      findFirst: vi.fn(),
      create: vi.fn()
    },
    product: { update: vi.fn() },
    $transaction: vi.fn((callback) => callback(prisma)),
  }
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/pusher', () => ({
  pusher: {
    trigger: vi.fn()
  }
}));

const { mockPaymentIntentsCreate } = vi.hoisted(() => ({
  mockPaymentIntentsCreate: vi.fn(),
}));
vi.mock('stripe', () => {
  return {
    default: function() {
      return {
        paymentIntents: {
          create: mockPaymentIntentsCreate
        }
      };
    }
  };
});

describe('Checkout Architecture Refactor: Payment Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPaymentIntent', () => {
        it('debe crear un intent con metadata userId vacía si el usuario es invitado', async () => {
            vi.mocked(auth).mockResolvedValue(null as any);
            mockPaymentIntentsCreate.mockResolvedValue({ client_secret: 'secret_123' });

            const cart = [ { productId: 1, quantity: 2, price: 100 } ];
            const res = await createPaymentIntent(200, cart);

            expect(res.success).toBe(true);
            expect(res.clientSecret).toBe('secret_123');
            expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(expect.objectContaining({
                metadata: {
                    userId: "",
                    productos: JSON.stringify([{ id: 1, cantidad: 2, precio: 100 }])
                }
            }));
        });

        it('debe crear un intent extrayendo el userId si el usuario está autenticado', async () => {
            vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' }, expires: "2026-01-01" } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user_uuid' } as any);
            mockPaymentIntentsCreate.mockResolvedValue({ client_secret: 'secret_456' });

            const cart = [ { productId: 5, quantity: 1, price: 50 } ];
            const res = await createPaymentIntent(50, cart);

            expect(res.success).toBe(true);
            expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(expect.objectContaining({
                metadata: expect.objectContaining({ userId: "user_uuid" })
            }));
        });
    });

    describe('processSuccessfulPayment', () => {
        const metadataBase = {
            userId: 'user_uuid',
            productos: JSON.stringify([{ id: 1, cantidad: 2, precio: 100 }])
        };

        it('debe detenerse si la orden ya existe (evitar duplicidad)', async () => {
            vi.mocked(prisma.order.findFirst).mockResolvedValue({ id: 'existing_order' } as any);
            
            const res = await processSuccessfulPayment('pi_123', 20000, metadataBase);
            expect(res.success).toBe(true);
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('debe procesar el pago correctamente e invocar a pusher si los datos son válidos', async () => {
            vi.mocked(prisma.order.findFirst).mockResolvedValue(null);
            
            const res = await processSuccessfulPayment('pi_123', 20000, metadataBase);

            expect(prisma.order.create).toHaveBeenCalled();
            expect(prisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { stock: { decrement: 2 } }
            });
            expect(pusher.trigger).toHaveBeenCalledWith('admin-notifications', 'nuevo-pedido', expect.any(Object));
            expect(res.success).toBe(true);
        });

        it('debe retornar error si falla el schema validator', async () => {
            const badMetadata = {
                userId: 'user_uuid',
                productos: JSON.stringify([{ id: -1, cantidad: 0 }]) // valores inválidos según schema
            };

            const res = await processSuccessfulPayment('pi_123', 20000, badMetadata);
            expect(res.success).toBe(false);
            expect(res.error).toBe("Internal Error");
            expect(prisma.order.create).not.toHaveBeenCalled();
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveInvoiceData, requestOrderInvoice } from '@/actions/billing-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        invoiceData: { upsert: vi.fn() },
        order: { findUnique: vi.fn(), update: vi.fn() }
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

describe('HU-51: Registrar RFC y Facturar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('HU-51: debería guardar los datos fiscales (RFC) correctamente', async () => {
        vi.mocked(prisma.invoiceData.upsert).mockResolvedValue({} as any);

        const data = {
            rfc: 'XAXX010101000',
            razonSocial: 'PUBLICO EN GENERAL',
            regimenFiscal: '616',
            codigoPostal: '69000',
            usoCFDI: 'G03'
        };

        vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-123' } } as any);
        const result = await saveInvoiceData('user-123', data);

        expect(result.success).toBe(true);
        expect(prisma.invoiceData.upsert).toHaveBeenCalled();
    });

    it('HU-51: debería solicitar factura exitosamente si el usuario tiene datos fiscales', async () => {
        // Simulamos una orden donde el usuario SÍ tiene invoiceData
        vi.mocked(prisma.order.findUnique).mockResolvedValue({
            id: 'order-123',
            userId: 'user-123',
            user: { invoiceData: { rfc: 'XAXX010101000' } }
        } as any);
        vi.mocked(prisma.order.update).mockResolvedValue({} as any);

        vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-123' } } as any);
        const result = await requestOrderInvoice('order-123');

        expect(result.success).toBe(true);
        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-123' },
            data: { invoiceRequested: true }
        });
    });

    it('HU-51: debería rechazar solicitud de factura si el usuario no tiene datos fiscales', async () => {
        // Simulamos una orden donde invoiceData es null
        vi.mocked(prisma.order.findUnique).mockResolvedValue({
            id: 'order-123',
            userId: 'user-123',
            user: { invoiceData: null }
        } as any);

        vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-123' } } as any);
        const result = await requestOrderInvoice('order-123');

        expect(result.success).toBe(false);
        expect(result.error).toBe('Faltan datos fiscales. Regístralos en tu perfil primero.');
    });
});
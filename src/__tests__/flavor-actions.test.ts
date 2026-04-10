import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        flavor: {
            findMany: vi.fn(),
        },
    },
}));

describe('getFlavors', () => {
    it('debería retornar sabores', async () => {
        const mockFlavors = [{ id: 1, name: 'Vainilla' }];
        vi.mocked(prisma.flavor.findMany).mockResolvedValue(mockFlavors as never);
        // Corrected import to flavor-actions since product-actions no longer has it
        const { getFlavors } = await import('../actions/flavor-actions');
        const result = await getFlavors();
        expect(result).toEqual(mockFlavors);
    });
});

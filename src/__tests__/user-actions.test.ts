import { describe, it, expect, vi } from 'vitest';
import { getAllUsers } from '../actions/user-actions';
import { prisma } from '@/lib/prisma';

// Mock dependencias
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
        },
    },
}));

describe('HU-21: Ver todos los usuarios', () => {
    it('HU-21: Debería retornar la lista de usuarios con el conteo de pedidos', async () => {
        const mockUsers = [
            { id: '1', name: 'User 1', email: 'user1@test.com', _count: { orders: 5 } },
            { id: '2', name: 'User 2', email: 'user2@test.com', _count: { orders: 2 } },
        ];

        vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

        const result = await getAllUsers();

        expect(prisma.user.findMany).toHaveBeenCalledWith({
            orderBy: { id: "desc" },
             include: {
                _count: {
                    select: { orders: true }
                }
            }
        });
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('User 1');
        expect(result[0]._count.orders).toBe(5);
        expect(result[1]._count.orders).toBe(2);
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserFavoriteStores, toggleFavoriteStore } from '../actions/favorite-store-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        favoriteStore: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('HU-48: favorite-store-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    // ---------------------------------------------------------------------------
    // getUserFavoriteStores
    // ---------------------------------------------------------------------------
    describe('HU-48: getUserFavoriteStores', () => {
        it('HU-48: debería retornar "No autorizado" si el usuario no tiene sesión', async () => {
            vi.mocked(auth).mockResolvedValueOnce(null as any);

            const result = await getUserFavoriteStores();

            expect(result).toEqual({ success: false, error: "No autorizado" });
            expect(prisma.favoriteStore.findMany).not.toHaveBeenCalled();
        });

        it('HU-48: debería retornar la lista de sucursales favoritas del usuario', async () => {
            const mockSession = { user: { id: 'user-1' } };
            vi.mocked(auth).mockResolvedValueOnce(mockSession as any);

            const mockFavorites = [
                { id: 'fav-1', storeId: 'store-1', store: { name: 'Tienda 1' } },
                { id: 'fav-2', storeId: 'store-2', store: { name: 'Tienda 2' } },
            ];
            vi.mocked(prisma.favoriteStore.findMany).mockResolvedValueOnce(mockFavorites as never);

            const result = await getUserFavoriteStores();

            expect(result.success).toBe(true);
            expect(result.favorites).toEqual(mockFavorites);
            expect(prisma.favoriteStore.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                include: { store: true },
                orderBy: { createdAt: "desc" },
            });
        });

        it('HU-48: debería manejar errores de base de datos al obtener sucursales favoritas', async () => {
            const mockSession = { user: { id: 'user-1' } };
            vi.mocked(auth).mockResolvedValueOnce(mockSession as any);

            vi.mocked(prisma.favoriteStore.findMany).mockRejectedValueOnce(new Error('DB Error'));

            const result = await getUserFavoriteStores();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error al obtener sucursales favoritas');
        });
    });

    // ---------------------------------------------------------------------------
    // toggleFavoriteStore
    // ---------------------------------------------------------------------------
    describe('HU-48: toggleFavoriteStore', () => {
        it('HU-48: debería retornar "No autorizado" si el usuario no tiene sesión', async () => {
            vi.mocked(auth).mockResolvedValueOnce(null as any);

            const result = await toggleFavoriteStore('store-1');

            expect(result).toEqual({ success: false, error: "No autorizado" });
            expect(prisma.favoriteStore.findUnique).not.toHaveBeenCalled();
        });

        it('HU-48: debería agregar la sucursal a favoritas si no lo estaba', async () => {
            const mockSession = { user: { id: 'user-1' } };
            vi.mocked(auth).mockResolvedValueOnce(mockSession as any);

            // Simula que NO existe la favorita
            vi.mocked(prisma.favoriteStore.findUnique).mockResolvedValueOnce(null);
            vi.mocked(prisma.favoriteStore.create).mockResolvedValueOnce({ id: 'new-fav' } as never);

            const result = await toggleFavoriteStore('store-new');

            expect(result.success).toBe(true);
            expect(result.isFavorite).toBe(true);
            expect(prisma.favoriteStore.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    storeId: 'store-new',
                },
            });
            expect(prisma.favoriteStore.delete).not.toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/perfil');
        });

        it('HU-48: debería eliminar la sucursal de favoritas si ya lo estaba', async () => {
            const mockSession = { user: { id: 'user-1' } };
            vi.mocked(auth).mockResolvedValueOnce(mockSession as any);

            // Simula que SÍ existe la favorita
            const existingFav = { id: 'existing-fav', userId: 'user-1', storeId: 'store-exist' };
            vi.mocked(prisma.favoriteStore.findUnique).mockResolvedValueOnce(existingFav as never);
            vi.mocked(prisma.favoriteStore.delete).mockResolvedValueOnce({} as never);

            const result = await toggleFavoriteStore('store-exist');

            expect(result.success).toBe(true);
            expect(result.isFavorite).toBe(false);
            expect(prisma.favoriteStore.delete).toHaveBeenCalledWith({
                where: { id: 'existing-fav' },
            });
            expect(prisma.favoriteStore.create).not.toHaveBeenCalled();
            expect(revalidatePath).toHaveBeenCalledWith('/perfil');
        });

        it('HU-48: debería manejar errores de base de datos al alternar estado de favorita', async () => {
            const mockSession = { user: { id: 'user-1' } };
            vi.mocked(auth).mockResolvedValueOnce(mockSession as any);

            vi.mocked(prisma.favoriteStore.findUnique).mockRejectedValueOnce(new Error('DB Error'));

            const result = await toggleFavoriteStore('store-error');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error al actualizar sucursal favorita');
            expect(revalidatePath).not.toHaveBeenCalled();
        });
    });
});

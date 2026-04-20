import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReview, getUserReview } from '@/actions/review-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Hacemos mock de prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    review: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Hacemos mock de auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Hacemos mock de next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('HU-08: Calificar Productos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HU-08: Crear una Review', () => {
    it('debería retornar un error si el usuario no ha iniciado sesión', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const result = await submitReview(1, 5, 'Excelente producto');

      expect(auth).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false, error: "Debes iniciar sesión para calificar este producto." });
    });

    it('debería retornar un error si la calificación es menor a 1', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);

      const result = await submitReview(1, 0, 'Malo');

      expect(result).toEqual({ success: false, error: "La calificación debe estar entre 1 y 5." });
    });

    it('debería retornar un error si la calificación es mayor a 5', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);

      const result = await submitReview(1, 6, 'Excelente');

      expect(result).toEqual({ success: false, error: "La calificación debe estar entre 1 y 5." });
    });

    it('debería crear una nueva reseña si no existe una previa', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);
      vi.mocked(prisma.review.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.review.create).mockResolvedValueOnce({} as any);

      const result = await submitReview(1, 4, 'Buen producto');

      expect(prisma.review.findFirst).toHaveBeenCalledWith({ where: { userId: 'user-id', productId: 1 } });
      expect(prisma.review.create).toHaveBeenCalledWith({
        data: { userId: 'user-id', productId: 1, rating: 4, comment: 'Buen producto' }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/productos/1');
      expect(result).toEqual({ success: true });
    });

    it('debería actualizar la reseña si ya existe una previamente', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);
      vi.mocked(prisma.review.findFirst).mockResolvedValueOnce({ id: 10, userId: 'user-id', productId: 1, rating: 3 } as any);
      vi.mocked(prisma.review.update).mockResolvedValueOnce({} as any);

      const result = await submitReview(1, 5, 'Excelente ahora sí');

      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { rating: 5, comment: 'Excelente ahora sí' }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/productos/1');
      expect(result).toEqual({ success: true });
    });

    it('debería manejar errores inesperados de la base de datos', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);
      vi.mocked(prisma.review.findFirst).mockRejectedValueOnce(new Error('Database error'));

      // Intentamos silenciar console.error para no ensuciar la salida del test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await submitReview(1, 4);

      expect(result).toEqual({ success: false, error: "Hubo un problema al guardar tu calificación." });
      consoleSpy.mockRestore();
    });
  });

  describe('HU-08: Obtener Review', () => {
    it('debería retornar null si el usuario no ha iniciado sesión', async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as any);

      const result = await getUserReview(1);

      expect(auth).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('debería retornar el review guardado si existe', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);
      const mockReview = { id: 10, userId: 'user-id', productId: 1, rating: 5, comment: 'Genial' };
      vi.mocked(prisma.review.findFirst).mockResolvedValueOnce(mockReview as any);

      const result = await getUserReview(1);

      expect(prisma.review.findFirst).toHaveBeenCalledWith({ where: { userId: 'user-id', productId: 1 } });
      expect(result).toEqual(mockReview);
    });

    it('debería manejar errores y retornar null', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ user: { id: 'user-id' } } as any);
      vi.mocked(prisma.review.findFirst).mockRejectedValueOnce(new Error('Internal error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getUserReview(1);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});

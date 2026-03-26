import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBanner, getBanners, toggleBannerStatus, deleteBanner } from '../actions/banner-actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// 1. Simulamos (Mock) la función de Next.js para que no rompa la prueba
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// 2. Simulamos la base de datos (Prisma) para no tocar la BD real
vi.mock('@/lib/prisma', () => ({
  prisma: {
    banner: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Banner Actions', () => {
  // Antes de cada prueba, limpiamos el historial de los simuladores
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBanner', () => {
    it('debería crear un banner y retornar success true', async () => {
      // Preparamos lo que Prisma "devolvería"
      const mockBanner = { id: 1, title: 'Promo', imageUrl: 'http://img.com', targetUrl: '', isActive: true };
      // @ts-expect-error ignoramos el tipado estricto del mock para esta prueba
      prisma.banner.create.mockResolvedValue(mockBanner);

      // Ejecutamos la acción
      const result = await createBanner({ title: 'Promo', imageUrl: 'http://img.com' });

      // Verificamos que todo salió bien
      expect(result.success).toBe(true);
      expect(result.banner).toEqual(mockBanner);
      
      // Verificamos que sí llamó a la base de datos y refrescó las rutas
      expect(prisma.banner.create).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/admin/banners');
    });

    it('debería manejar errores si Prisma falla', async () => {
      // Hacemos que Prisma tire un error a propósito
      // @ts-expect-error
      prisma.banner.create.mockRejectedValue(new Error('Error de BD'));

      const result = await createBanner({ title: 'Promo', imageUrl: 'http://img.com' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Error al guardar el banner en la base de datos.');
    });
  });

  describe('getBanners', () => {
    it('debería traer todos los banners si no se le pasa parámetro', async () => {
      const mockBanners = [{ id: 1, title: 'Promo' }];
      // @ts-expect-error
      prisma.banner.findMany.mockResolvedValue(mockBanners);

      const result = await getBanners();

      expect(result).toEqual(mockBanners);
      expect(prisma.banner.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });

    it('debería traer solo los activos si onlyActive es true', async () => {
      // @ts-expect-error
      prisma.banner.findMany.mockResolvedValue([]);

      await getBanners(true);

      // Verificamos que le mandó la condición `isActive: true` a Prisma
      expect(prisma.banner.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('toggleBannerStatus', () => {
    it('debería actualizar el estado y refrescar las rutas', async () => {
      // @ts-expect-error
      prisma.banner.update.mockResolvedValue({ id: 1, isActive: false });

      const result = await toggleBannerStatus(1, false);

      expect(result.success).toBe(true);
      expect(prisma.banner.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });

  describe('deleteBanner', () => {
    it('debería borrar el banner permanentemente', async () => {
      // @ts-expect-error
      prisma.banner.delete.mockResolvedValue({ id: 1 });

      const result = await deleteBanner(1);

      expect(result.success).toBe(true);
      expect(prisma.banner.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createBanner,
  getBanners,
  toggleBannerStatus,
  deleteBanner,
} from "../actions/banner-actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Simulamos (Mock) la función de Next.js
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// 2. Simulamos la base de datos (Prisma)
vi.mock("@/lib/prisma", () => ({
  prisma: {
    banner: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("HU-70 Creacion de banners promocionales", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HU-70: Crear y gestionar banners - createBanner", () => {
    it("debería crear un banner si los datos pasan la validación de Zod", async () => {
      const mockBanner = {
        id: 1,
        title: "Promo",
        imageUrl: "http://img.com",
        targetUrl: "",
        isActive: true,
      };
      // @ts-expect-error - mocked database response
      prisma.banner.create.mockResolvedValue(mockBanner);

      const result = await createBanner({
        title: "Promo",
        imageUrl: "http://img.com",
      });

      expect(result.success).toBe(true);
      expect(result.banner).toEqual(mockBanner);
      expect(prisma.banner.create).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/");
      expect(revalidatePath).toHaveBeenCalledWith("/admin/banners");
    });

    // --- NUEVAS PRUEBAS PARA ZOD ---

    it("debería bloquear la creación si el título tiene menos de 3 caracteres", async () => {
      // Mandamos un título de 2 letras
      const result = await createBanner({
        title: "ab",
        imageUrl: "http://img.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("El título debe tener al menos 3 caracteres.");

      // Súper importante: Verificamos que Prisma NUNCA fue llamado para proteger la BD
      expect(prisma.banner.create).not.toHaveBeenCalled();
    });

    it("debería bloquear la creación si el targetUrl tiene un formato inválido", async () => {
      // Mandamos una URL sin http:// ni /
      const result = await createBanner({
        title: "Promo San Valentín",
        imageUrl: "http://img.com",
        targetUrl: "www.misitio.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "El enlace debe ser una ruta interna (ej: /productos) o una URL válida (ej: https://...)",
      );
      expect(prisma.banner.create).not.toHaveBeenCalled();
    });

    // -------------------------------

    it("debería manejar errores si Prisma falla", async () => {
      // @ts-expect-error - mocked db error
      prisma.banner.create.mockRejectedValue(new Error("Error de BD"));

      const result = await createBanner({
        title: "Promo",
        imageUrl: "http://img.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Error al guardar el banner en la base de datos.",
      );
    });
  });

  // ... (getBanners, toggleBannerStatus y deleteBanner se quedan exactamente igual) ...
  describe("HU-49: Visualizar banners promocionales - getBanners", () => {
    it("debería traer todos los banners si no se le pasa parámetro", async () => {
      const mockBanners = [{ id: 1, title: "Promo" }];
      // @ts-expect-error - mocked database array response
      prisma.banner.findMany.mockResolvedValue(mockBanners);

      const result = await getBanners();

      expect(result).toEqual(mockBanners);
      expect(prisma.banner.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("debería traer solo los activos si onlyActive es true", async () => {
      // @ts-expect-error - mocked database empty response
      prisma.banner.findMany.mockResolvedValue([]);

      await getBanners(true);

      expect(prisma.banner.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("HU-70: Crear y gestionar banners - toggleBannerStatus", () => {
    it("debería actualizar el estado y refrescar las rutas", async () => {
      // @ts-expect-error - mocked database update
      prisma.banner.update.mockResolvedValue({ id: 1, isActive: false });

      const result = await toggleBannerStatus(1, false);

      expect(result.success).toBe(true);
      expect(prisma.banner.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });

  describe("HU-70: Crear y gestionar banners - deleteBanner", () => {
    it("debería borrar el banner permanentemente", async () => {
      // @ts-expect-error - mocked database delete
      prisma.banner.delete.mockResolvedValue({ id: 1 });

      const result = await deleteBanner(1);

      expect(result.success).toBe(true);
      expect(prisma.banner.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});

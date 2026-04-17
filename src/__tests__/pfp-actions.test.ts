import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfileImage } from "../actions/pfp-actions"; // <-- Ajusta esto a tu ruta real
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 🔥 LA MAGIA ESTÁ AQUÍ: vi.hoisted() asegura que esto se cree antes que los mocks
const { mockDeleteFiles } = vi.hoisted(() => {
  return { mockDeleteFiles: vi.fn().mockResolvedValue({ success: true }) };
});

// 1. Simular (Mock) Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// 2. Simular (Mock) Next.js Cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// 3. Simular (Mock) UploadThing y su método deleteFiles
vi.mock("uploadthing/server", () => {
  return {
    UTApi: class {
      deleteFiles = mockDeleteFiles;
    },
  };
});
describe("Action: updateProfileImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería actualizar la imagen a un usuario que NO tenía foto previa (sin borrar nada)", async () => {
    const userId = "test-user-id";
    const newImageUrl = "https://utfs.io/f/new-file-key.png";

    // Preparamos entorno: el usuario no tiene imagen en DB
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ image: null } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    // Ejecutamos action
    const result = await updateProfileImage(userId, newImageUrl);

    // Validamos
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: { image: true },
    });

    expect(mockDeleteFiles).not.toHaveBeenCalled(); // No borra nada

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { image: newImageUrl },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/perfil");

    expect(result).toEqual({
      success: true,
      message: "Foto de perfil actualizada correctamente",
    });
  });

  it("debería extraer la key correcta y borrar la imagen vieja si la URL de la foto cambia", async () => {
    const userId = "test-user-id";
    const oldFileKey = "old-file-key.png";
    const oldImageUrl = `https://utfs.io/f/${oldFileKey}`;
    const newImageUrl = "https://utfs.io/f/new-file-key.png";

    // Entorno: el usuario YA TIENE una imagen
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: oldImageUrl,
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const result = await updateProfileImage(userId, newImageUrl);

    // Se debió mandar a borrar el 'old-file-key.png'
    expect(mockDeleteFiles).toHaveBeenCalledWith(oldFileKey);
    // Y se la actualiza en prisma
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { image: newImageUrl },
    });
    expect(result.success).toBe(true);
  });

  it("debería ignorar el borrado si la foto nueva es idéntica a la que ya tenía (misma URL)", async () => {
    const userId = "test-user-id";
    const imageUrl = "https://utfs.io/f/same-image.png";

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: imageUrl,
    } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    const result = await updateProfileImage(userId, imageUrl);

    expect(mockDeleteFiles).not.toHaveBeenCalled(); // Evita borrar el archivo
    expect(prisma.user.update).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("debería continuar actualizando todo el perfil incluso si UTApi.deleteFiles Falla", async () => {
    const userId = "test-user-id";
    const oldImageUrl = "https://utfs.io/f/old-file.png";
    const newImageUrl = "https://utfs.io/f/new-file.png";

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      image: oldImageUrl,
    } as any);
    mockDeleteFiles.mockRejectedValueOnce(
      new Error("Fallo de UploadThing en la Nube"),
    );
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    // Silencio del console.error artificial solo para la terminal
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await updateProfileImage(userId, newImageUrl);

    expect(mockDeleteFiles).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled(); // Se asegura que sí se actualiza en Prisma
    expect(result.success).toBe(true); // Termina con éxito porque fallar el borrado no tira proceso global

    consoleSpy.mockRestore();
  });

  it("debería retornar éxito falso si Prisma arroja un error severo en la BD", async () => {
    const userId = "test-user-id";
    const newImageUrl = "https://utfs.io/f/new-file.png";

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ image: null } as any);
    // Hacemos que Prisma crasheé
    vi.mocked(prisma.user.update).mockRejectedValue(
      new Error("Conexión BD fallida"),
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await updateProfileImage(userId, newImageUrl);

    expect(result).toEqual({
      success: false,
      message: "Hubo un error al actualizar la imagen en el servidor",
    });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

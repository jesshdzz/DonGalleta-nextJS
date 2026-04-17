"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";

export async function updateEmail(
    userId: string,
    newEmail: string,
    currentPassword: string
) {
    const parsed = z.string().email("Correo inválido").safeParse(newEmail);
    if (!parsed.success)
        return { success: false, message: parsed.error.issues[0].message };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password)
        return { success: false, message: "No se puede cambiar el correo en esta cuenta." };

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
        return { success: false, message: "Contraseña actual incorrecta." };

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing)
        return { success: false, message: "Este correo ya está en uso." };

    await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });
    revalidatePath("/perfil");
    return { success: true };
}

export async function updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
) {
    const parsed = z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .safeParse(newPassword);
    if (!parsed.success)
        return { success: false, message: parsed.error.issues[0].message };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password)
        return { success: false, message: "No se puede cambiar la contraseña en esta cuenta." };

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
        return { success: false, message: "Contraseña actual incorrecta." };

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });
    revalidatePath("/perfil");
    return { success: true };
}

export async function deleteAccount(userId: string, currentPassword?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Usuario no encontrado." };
    // Usuario con contraseña
    if (user.password) {
        if (!currentPassword)
            return { success: false, message: "Debes ingresar tu contraseña para continuar." };

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match)
            return { success: false, message: "Contraseña incorrecta. No se eliminó la cuenta." };
    }
    // Usuario Google
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
}

export async function getAllUsers() {
    const users = await prisma.user.findMany({
        orderBy: { id: "desc" },
        include: {
            _count: {
                select: { orders: true }
            }
        }
    });

    return users;
}

export async function changeRole(userId: string, newRole: Role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: "Usuario no encontrado." };

    await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
    revalidatePath("/admin/usuarios");
    return { success: true };
}


const utapi = new UTApi();

export async function updateProfileImage(userId: string, newImageUrl: string) {
  // Verificamos que quien llama sea el dueño del perfil
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId)
    return { success: false, message: "No autorizado." };

  try {
    // 1. Buscamos al usuario para ver si ya tiene una foto previa registrada
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    // 2. Limpieza en la Nube: Si ya tenía foto y es distinta a la nueva, la borramos
    if (user?.image && user.image !== newImageUrl) {
      // Las URLs de UploadThing son tipo "https://utfs.io/f/llave-del-archivo"
      // Extraemos solo la llave para poder borrarlo
      const fileKey = user.image.split("/f/")[1];
      
      if (fileKey) {
        // Usamos .catch interno para que si falla el borrado, no tumbe todo el proceso
        await utapi.deleteFiles(fileKey).catch((err) => 
          console.error("Error borrando foto vieja de UploadThing:", err)
        );
      }
    }

    // 3. Actualizamos el campo 'image' en Prisma con la nueva URL
    await prisma.user.update({
      where: { id: userId },
      data: { image: newImageUrl },
    });

    // 4. Refrescamos la caché de Next.js para que los cambios se vean de inmediato
    // Refrescamos el perfil y cualquier otra ruta donde salga el Avatar (ej. el Navbar)
    revalidatePath("/");
    revalidatePath("/perfil");

    return { success: true, message: "Foto de perfil actualizada correctamente" };
  } catch (error) {
    console.error("Error al actualizar la imagen de perfil:", error);
    return { success: false, message: "Hubo un error al actualizar la imagen en el servidor" };
  }
}
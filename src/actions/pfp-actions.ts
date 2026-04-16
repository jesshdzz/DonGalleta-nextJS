"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";

// Instanciamos la API de UploadThing para poder borrar archivos desde el servidor
const utapi = new UTApi();

export async function updateProfileImage(userId: string, newImageUrl: string) {
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
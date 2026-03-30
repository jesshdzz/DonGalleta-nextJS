"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. DEFINIMOS EL ESQUEMA DE ZOD
const bannerSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres." }),
  imageUrl: z.string().url(),
  targetUrl: z.string()
    .optional()
    .refine((val) => {
      // Si está vacío, es válido
      if (!val || val === "") return true;
      // Si tiene texto, DEBE empezar con "/" (ruta interna) o con "http" (ruta externa)
      return val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://");
    }, { 
      message: "El enlace debe ser una ruta interna (ej: /productos) o una URL válida (ej: https://...)" 
    })
});

// 2. Guardar el banner en la base de datos (AHORA CON VALIDACIÓN)
export async function createBanner({ title, imageUrl, targetUrl }: { title: string, imageUrl: string, targetUrl?: string }) {
    try {
        // Pasamos los datos por el filtro de Zod
        const validatedData = bannerSchema.safeParse({ title, imageUrl, targetUrl: targetUrl || "" });

        if (!validatedData.success) {
            // Si Zod detecta un error, sacamos el primer mensaje de error y lo mandamos al cliente
            return { success: false, error: validatedData.error.issues[0].message };
        }

        const banner = await prisma.banner.create({
            data: { 
                title: validatedData.data.title,
                imageUrl: validatedData.data.imageUrl, 
                targetUrl: validatedData.data.targetUrl,
                isActive: true
            }
        });
        
        revalidatePath("/");
        revalidatePath("/admin/banners");
        
        return { success: true, banner };
    } catch (error) {
        return { success: false, error: "Error al guardar el banner en la base de datos." };
    }
}

// 2. Obtener los banners (Añadimos el parámetro para poder filtrar los activos en el Home)
export async function getBanners(onlyActive: boolean = false) {
    try {
        return await prisma.banner.findMany({
            // Si onlyActive es true, filtramos; si es false, traemos todos (para el panel admin)
            where: onlyActive ? { isActive: true } : undefined, 
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        return [];
    }
}

// 3. Apagar o prender un banner (¡LA ACCIÓN QUE FALTABA PARA EL SWITCH!)
export async function toggleBannerStatus(id: number, isActive: boolean) {
    try {
        await prisma.banner.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath("/");
        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al cambiar el estado del banner." };
    }
}

// 4. Eliminar un banner 
export async function deleteBanner(id: string | number) {
    try {
        await prisma.banner.delete({ where: { id: Number(id) } });
        revalidatePath("/");
        revalidatePath("/admin/banners");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el banner." };
    }
}
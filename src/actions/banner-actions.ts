"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Guardar el banner en la base de datos
export async function createBanner({ title, imageUrl, targetUrl }: { title: string, imageUrl: string, targetUrl?: string }) {
    try {
        const banner = await prisma.banner.create({
            data: { 
                title,
                imageUrl, 
                targetUrl: targetUrl || "",
                isActive: true // <-- Agregamos esto para que al crearlo nazca prendido
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
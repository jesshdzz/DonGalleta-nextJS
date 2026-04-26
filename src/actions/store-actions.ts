"use server";

import { prisma } from "@/lib/prisma";
import { storeSchema } from "@/lib/validators/store-schema";
import { revalidatePath } from "next/cache";

// --- OBTENER TIENDAS ---
export async function getStores() {
    const stores = await prisma.store.findMany({
        orderBy: { createdAt: "desc" },
    });
    return stores;
}

export async function getAdminStores(params?: { page?: number; pageSize?: number }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [total, stores] = await Promise.all([
        prisma.store.count(),
        prisma.store.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        })
    ]);

    return {
        stores,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        totalItems: total,
    };
}

// --- CREAR / EDITAR TIENDA ---
export async function upsertStore(prevState: unknown, formData: FormData) {
    // 1. Convertir FormData a objeto simple para Zod
    const rawData = {
        name: formData.get("name"),
        address: formData.get("address"),
        schedule: formData.get("schedule"),
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
        phone: formData.get("phone"),
        isActive: formData.get("isActive") === "on",
    };

    // 2. Validar datos
    const validatedFields = storeSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error en los datos enviados",
        };
    }

    const { data } = validatedFields;
    const id = formData.get("id") as string | null; // Si viene ID, es edición

    try {
        if (id) {
            // --- MODO EDICIÓN ---
            await prisma.store.update({
                where: { id },
                data,
            });
        } else {
            // --- MODO CREACIÓN ---
            await prisma.store.create({
                data,
            });
        }
    } catch (error) {
        console.error("Error en DB:", error);
        return {
            success: false,
            message: "Error al guardar en base de datos.",
        };
    }

    // 3. Actualizar caché
    revalidatePath("/admin/tiendas");

    return { success: true, message: "Sucursal guardada correctamente" };
}

// --- ELIMINAR TIENDA ---
export async function deleteStore(id: string) {
    try {
        await prisma.store.delete({
            where: { id },
        });
        revalidatePath("/admin/tiendas");
        return { success: true };
    } catch {
        return { message: "No se pudo eliminar la sucursal" };
    }
}

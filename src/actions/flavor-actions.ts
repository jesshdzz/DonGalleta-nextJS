'use server';

import { prisma } from "@/lib/prisma";
import { flavorSchema } from "@/lib/validators/flavor-schema";
import { revalidatePath } from "next/cache";

// --- OBTENER SABORES ---
export async function getFlavors() {
    const flavors = await prisma.flavor.findMany({
        orderBy: { name: 'asc' },
    });
    return flavors;
}

// --- CREAR / EDITAR SABOR ---
export async function upsertFlavor(prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get("name"),
    };

    const validatedFields = flavorSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error en los datos del sabor",
        };
    }

    const { data } = validatedFields;
    const id = formData.get("id") as string | null;

    try {
        if (id) {
            await prisma.flavor.update({
                where: { id: parseInt(id) },
                data: data,
            });
        } else {
            await prisma.flavor.create({
                data: data,
            });
        }
        revalidatePath("/admin/sabores");
        revalidatePath("/admin/productos/nuevo");
        revalidatePath("/admin/productos/[id]/editar");
        return { success: true, message: "Sabor guardado correctamente" };
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            return { success: false, message: "Ya existe un sabor con ese nombre" };
        }
        return { success: false, message: "Error al guardar el sabor" };
    }
}

// --- ELIMINAR SABOR ---
export async function deleteFlavor(id: number) {
    try {
        await prisma.flavor.delete({
            where: { id },
        });
        revalidatePath("/admin/sabores");
        return { success: true, message: "Sabor eliminado" };
    } catch (error) {
        return { success: false, message: "No se pudo eliminar el sabor" };
    }
}

'use server';

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators/product-schema";
import { revalidatePath } from "next/cache";

// --- OBTENER PRODUCTOS ---
export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: 'desc' }, // Los más nuevos primero
  });
  return products;
}

// --- CREAR / EDITAR PRODUCTO ---
export async function upsertProduct(prevState: any, formData: FormData) {
  // 1. Convertir FormData a objeto simple para Zod
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    isActive: formData.get("isActive") === "on", // Checkbox envía "on"
  };

  // 2. Validar datos
  const validatedFields = productSchema.safeParse(rawData);

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
      await prisma.product.update({
        where: { id: parseInt(id) },
        data: data,
      });
    } else {
      // --- MODO CREACIÓN ---
      await prisma.product.create({
        data: data,
      });
    }
  } catch (error) {
    console.error(error);
    return { 
      success: false,
      message: "Error al guardar en base de datos. ¿Quizás el Slug ya existe?" };
  }

  // 3. Actualizar caché y redireccionar
  revalidatePath("/admin/products");
  return { success: true, message: "Producto guardado correctamente" };
}

// --- ELIMINAR PRODUCTO ---
export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { message: "No se pudo eliminar el producto" };
  }
}
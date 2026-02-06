"use server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators/product-schema";
import { revalidatePath } from "next/cache";
import { flattenError, includes } from "zod";
import { tr } from "zod/v4/locales";

// --- OBTENER PRODUCTOS ---
export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { id: "desc" }, // Los más nuevos primero
  });

  // Serializar Decimal a number para evitar error de "Plain Objects" en Client Components
  return products.map((product) => ({
    ...product,
    price: product.price.toNumber(), // Decimal.js -> number
  }));
}

// --- VERIFICAR STOCK ---
export async function checkStock(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });
  return product ? product.stock : 0;
}

// --- CHECKOUT (Actualizar Stock) ---
export async function checkout(
  items: { productId: number; quantity: number }[],
) {
  try {
    // Verificar stock de todos primero
    for (const item of items) {
      const currentStock = await checkStock(item.productId);
      if (currentStock < item.quantity) {
        return {
          success: false,
          message: `Stock insuficiente para el producto ID ${item.productId}`,
        };
      }
    }

    // Realizar transacción
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    revalidatePath("/admin/products");
    revalidatePath("/productos");

    return { success: true, message: "Compra realizada con éxito" };
  } catch (error) {
    console.error("Error en checkout:", error);
    return { success: false, message: "Error al procesar la compra" };
  }
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
    console.error("Error en DB:", error);
    return {
      success: false,
      message: "Error al guardar en base de datos. ¿Quizás el Slug ya existe?",
    };
  }

  // 3. Actualizar caché y redireccionar
  revalidatePath("/admin/products");
  revalidatePath("/productos");

  return { success: true, message: "Producto guardado correctamente" };
}

// --- ELIMINAR PRODUCTO ---
export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/products");
    revalidatePath("/productos");
    return { success: true };
  } catch (error) {
    return { message: "No se pudo eliminar el producto" };
  }
}

// --- OBTENER PRODUCTOS FILTRADOS (CHECKBOXES)---
export async function getFilteredProducts(filters: { flavors?: string[] }) {
  const products = await prisma.product.findMany({
    where: filters.flavors?.length
      ? {
          flavors: {
            some: {
              flavor: {
                name: { in: filters.flavors },
              },
            },
          },
        }
      : undefined,
    orderBy: { id: "desc" },
    include: { flavors: { include: { flavor: true } } },
  });

  return products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
  }));
}
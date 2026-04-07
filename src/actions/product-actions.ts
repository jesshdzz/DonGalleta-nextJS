"use server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators/product-schema";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// --- OBTENER PRODUCTOS ---
export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { id: "desc" }, // Los más nuevos primero
    include: { flavors: { include: { flavor: true } } },
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
    const session = await auth();
    if (!session?.user) {
      console.log("[AUTH-CHECKOUT] No valid session found. Blocking guest checkout.");
      return { success: false, message: "Regístrate para procesar tu carrito.", isAuthError: true };
    }
    console.log(`[AUTH-CHECKOUT] Session valid for user: ${session.user.email || session.user.id}`);

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

    revalidatePath("/admin/productos");
    revalidatePath("/productos");

    return { success: true, message: "Compra realizada con éxito" };
  } catch (error) {
    console.error("Error en checkout:", error);
    return { success: false, message: "Error al procesar la compra" };
  }
}

// --- CREAR / EDITAR PRODUCTO ---
export async function upsertProduct(prevState: unknown, formData: FormData) {
  // 1. Convertir FormData a objeto simple para Zod
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    slug: formData.get("slug"),
    image: formData.get("image"),
    isActive: formData.get("isActive") === "on",
    flavors: formData.get("flavors") ? JSON.parse(formData.get("flavors") as string) : [],
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
        data: {
          ...data,
          flavors: {
            deleteMany: {}, // Borramos relaciones anteriores
            create: data.flavors?.map((flavorId) => ({ flavorId })), // Creamos nuevas
          }
        },
      });
    } else {
      // --- MODO CREACIÓN ---
      await prisma.product.create({
        data: {
          ...data,
          flavors: {
            create: data.flavors?.map((flavorId) => ({ flavorId })),
          }
        },
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
  revalidatePath("/admin/productos");
  revalidatePath("/productos");

  return { success: true, message: "Producto guardado correctamente" };
}

// --- ELIMINAR PRODUCTO ---
export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { success: true };
  } catch {
    return { message: "No se pudo eliminar el producto" };
  }
}

// --- OBTENER PRODUCTOS FILTRADOS (CHECKBOXES)---
// En product-actions.ts
export async function getFilteredProducts(filters: { flavors?: string[]; query?: string }) {
  const { flavors, query } = filters;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      // 1. Aplica el filtro de checkboxes (si existen)
      ...(flavors?.length ? {
        flavors: {
          some: { flavor: { name: { in: flavors } } },
        },
      } : {}),
      // 2. Aplica el filtro de búsqueda por o (si existe)
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { flavors: { some: { flavor: { name: { contains: query } } } } },
        ],
      } : {}),
    },
    orderBy: { id: "desc" },
    include: { flavors: { include: { flavor: true } } },
  });

  return products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
  }));
}

// --- OBTENER SABORES DISPONIBLES ---
export async function getFlavors() {
  const flavors = await prisma.flavor.findMany({
    orderBy: { name: 'asc' },
  });
  return flavors;
}

// --- BUSCAR PRODUCTOS (LIVE SEARCH) ---
export async function searchProducts(query: string, limit?: 5) {
  if (!query || query.length < 3) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true, // Solo mostrar productos que no estén "borrados"
        OR: [
          { name: { contains: query } }, // Búsqueda por nombre de galleta
          {
            flavors: {
              some: {
                flavor: {
                  name: { contains: query }, // Búsqueda por nombre de sabor
                },
              },
            },
          },
        ],
      },
      take: limit, // Límite para no saturar el menú desplegable
      include: {
        flavors: {
          include: { flavor: true },
        },
      },
    });

    // Formatear los datos para enviarlos limpios al Client Component
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug, // Usaremos el slug para la URL
      price: p.price.toNumber(),
      // Juntamos todos los sabores en un solo o separado por comas
      flavor: p.flavors.map((f) => f.flavor.name).join(", "),
      image: p.image,
    }));
  } catch (error) {
    console.error("Error buscando productos:", error);
    return [];
  }
}

export async function getRelatedProducts(currentProductId: number, limit: number = 4) {
  try {
    // 1. Obtener los IDs de los sabores del producto actual
    const currentProduct = await prisma.product.findUnique({
      where: { id: currentProductId },
      include: { flavors: true },
    });

    const flavorIds = currentProduct?.flavors.map((f) => f.flavorId) || [];

    // 2. Buscar productos que tengan al menos uno de esos sabores
    let related = await prisma.product.findMany({
      where: {
        id: { not: currentProductId },
        isActive: true,
        // Solo aplicamos este filtro si el producto original tiene sabores asignados
        ...(flavorIds.length > 0
          ? { flavors: { some: { flavorId: { in: flavorIds } } } }
          : {}),
      },
      take: limit,
      // Incluimos los sabores para poder mostrarlos en la tarjeta
      include: {
        flavors: {
          include: { flavor: true },
        },
      },
    });

    // 3. Rellenar con productos recientes si no alcanzamos el límite
    if (related.length < limit) {
      const moreProducts = await prisma.product.findMany({
        where: {
          id: { notIn: [currentProductId, ...related.map((p) => p.id)] },
          isActive: true,
        },
        take: limit - related.length,
        orderBy: { id: "desc" },
        include: {
          flavors: {
            include: { flavor: true },
          },
        },
      });

      related = [...related, ...moreProducts];
    }

    return related;
  } catch (error) {
    console.error("Error obteniendo productos relacionados:", error);
    return [];
  }
}
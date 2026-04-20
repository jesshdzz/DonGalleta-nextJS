'use server';

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddressSchema = z.object({
  alias: z.string().optional(),
  street: z.string().min(1, "La calle es requerida"),
  externalNumber: z.string().min(1, "El número exterior es requerido"),
  internalNumber: z.string().optional(),
  neighborhood: z.string().min(1, "La colonia es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  zipCode: z.string().min(1, "El código postal es requerido"),
  references: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof AddressSchema>;

export async function getUserAddresses() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    return { success: true, addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Error al obtener las direcciones" };
  }
}

export async function createAddress(data: AddressFormValues) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = AddressSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  try {
    // Si esta es la primera dirección o se marcó como default, quitamos el default a las demás
    const count = await prisma.userAddress.count({ where: { userId: session.user.id } });
    const isFirst = count === 0;
    
    if (parsed.data.isDefault || isFirst) {
      await prisma.userAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    await prisma.userAddress.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        isDefault: parsed.data.isDefault || isFirst,
      }
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Error al crear la dirección" };
  }
}

export async function updateAddress(id: string, data: AddressFormValues) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  const parsed = AddressSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  try {
    const existing = await prisma.userAddress.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Dirección no encontrada" };
    }

    if (parsed.data.isDefault && !existing.isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    await prisma.userAddress.update({
      where: { id },
      data: parsed.data
    });

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Error al actualizar la dirección" };
  }
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const existing = await prisma.userAddress.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Dirección no encontrada" };
    }

    await prisma.userAddress.delete({ where: { id } });

    // Si borramos la default, asignamos default a la más reciente (si hay)
    if (existing.isDefault) {
      const remaining = await prisma.userAddress.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      });
      if (remaining) {
        await prisma.userAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true }
        });
      }
    }

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Error al eliminar la dirección" };
  }
}

export async function setDefaultAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const existing = await prisma.userAddress.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return { success: false, error: "Dirección no encontrada" };
    }

    await prisma.$transaction([
      prisma.userAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      }),
      prisma.userAddress.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    revalidatePath("/perfil");
    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Error al establecer la dirección predeterminada" };
  }
}

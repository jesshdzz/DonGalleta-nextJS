"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

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

export async function deleteAccount(userId: string, currentPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password)
        return { success: false, message: "No se puede eliminar esta cuenta desde aquí." };

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
        return { success: false, message: "Contraseña incorrecta. No se eliminó la cuenta." };

    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
}

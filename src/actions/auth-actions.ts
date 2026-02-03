'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
});

export async function registerUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = RegisterSchema.safeParse(data);

  if (!parsed.success) {
    return { error: 'Datos inválidos' };
  }

  const { email, password, name } = parsed.data;

  // Verificar si existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'El usuario ya existe' };

  // Crear hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario (Por defecto USER, luego lo cambiamos a ADMIN en Prisma Studio)
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER', 
    },
  });

  return { success: true };
}
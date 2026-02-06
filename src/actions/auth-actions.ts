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
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors
    };
  }

  const { email, password, name } = parsed.data;

  // Verificar si existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      errors: { email: ['El correo electrónico ya está registrado'] }
    };
  }

  // Crear hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: 'Error al crear el usuario en la base de datos'
    };
  }
}
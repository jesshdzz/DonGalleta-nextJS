'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import crypto from 'crypto';

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
});

// Función auxiliar para validar con Cloudflare
async function verifyTurnstileToken(token: string) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
  });
  const data = await res.json();
  return data.success;
}

export async function registerUser(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = RegisterSchema.safeParse(data);
  const token = formData.get('cf-turnstile-response') as string;

  if (!token) {
    return { error: 'Por favor, completa la validación de seguridad (Captcha).' };
  }

  const isValidToken = await verifyTurnstileToken(token);
  if (!isValidToken) {
    return { error: 'Validación de seguridad fallida. Intenta nuevamente.' };
  }

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
  } catch {
    return {
      success: false,
      message: 'Error al crear el usuario en la base de datos'
    };
  }
}

// Restablecimiento de contraseña 

export async function requestPasswordReset(email: string) {
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { success: false, message: 'Correo electrónico inválido.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: true };
  }

  // Solo cuentas con contraseña (no OAuth)
  if (!user.password) {
    return {
      success: false,
      message: 'Esta cuenta usa un proveedor externo (Google, etc.). No es posible restablecer la contraseña aquí.',
    };
  }

  // Eliminar tokens previos del usuario
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Generar nuevo token seguro
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset/${token}`;
  const emailHtml = await render(
    PasswordResetEmail({ userName: user.name ?? 'Usuario', resetUrl })
  );

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"DonGalleta" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Restablece tu contraseña – DonGalleta',
    html: emailHtml,
  });

  return { success: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const parsed = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').safeParse(newPassword);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return { success: false, message: 'El enlace de restablecimiento no es válido.' };
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return { success: false, message: 'El enlace ha expirado. Solicita uno nuevo.' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    // Invalidar el token usado
    prisma.passwordResetToken.delete({ where: { token } })
  ]);

  return { success: true };
}
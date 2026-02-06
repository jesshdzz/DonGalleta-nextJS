'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { registerUser } from '@/actions/auth-actions';
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Schema de validación idéntico/compatible con el de servidor
const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    setSuccess('');

    try {
      // Creamos FormData para enviar al Server Action (manteniendo compatibilidad)
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);

      const result = await registerUser(formData);

      if (result?.errors) {
        // Mapear errores del servidor a los campos del formulario
        if (result.errors.name) setError('name', { message: result.errors.name[0] });
        if (result.errors.email) setError('email', { message: result.errors.email[0] });
        if (result.errors.password) setError('password', { message: result.errors.password[0] });
      } else if (result?.message) {
        setServerError(result.message);
      } else if (result?.success) {
        setSuccess('¡Cuenta creada exitosamente!');
        setTimeout(() => {
          router.push('/auth/login');
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setServerError('Ocurrió un error inesperado. Inténtalo de nuevo.');
    }
  };

  return (
    <Card className="shadow-lg border-secondary/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-primary">Crear Cuenta</CardTitle>
        <CardDescription>
          Completa tus datos para empezar a pedir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              placeholder="Ej. Juan Pérez"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              {...register('password')}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.password.message}</p>
            )}
          </div>

          {/* Feedback Visual Global */}
          {serverError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {serverError}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4 mt-2">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
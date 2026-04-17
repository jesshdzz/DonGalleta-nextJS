'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { registerUser } from '@/actions/auth-actions';
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile'; // <-- Importamos Turnstile

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Schema de validación idéntico/compatible con el de servidor
const RegisterSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  // mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Estado y Referencia para el Captcha
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = form;

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('');
    setSuccess('');

    // Validación extra en el cliente para asegurar que resolvió el Captcha
    if (!captchaToken) {
      setServerError('Por favor, espera a que se complete la validación de seguridad.');
      return;
    }

    try {
      // Creamos FormData para enviar al Server Action
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('cf-turnstile-response', captchaToken); // <-- Agregamos el token manualmente

      const result = await registerUser(formData);

      if (result?.emailConflict) {
        // Redirigir al login
        const errorParam =
          result.emailConflict === 'google' ? 'EmailRegistradoConGoogle' : 'EmailYaRegistrado';
        router.push(`/auth/login?error=${errorParam}`);
        return;
      } else if (result?.errors) {
        // Mapear errores de Zod del servidor
        if (result.errors.name) setError('name', { message: result.errors.name[0] });
        if (result.errors.email) setError('email', { message: result.errors.email[0] });
        if (result.errors.password) setError('password', { message: result.errors.password[0] });
        turnstileRef.current?.reset(); // Reiniciamos captcha si falla
      } else if (result?.message || result?.error) {
        // Mapear errores generales (ej. Correo duplicado o fallo de Turnstile backend)
        setServerError(result.message || result.error || 'Error al procesar el registro');
        turnstileRef.current?.reset(); // Reiniciamos captcha si falla
      } else if (result?.success) {
        setSuccess('¡Cuenta creada exitosamente!');
        setTimeout(() => {
          router.push('/auth/login');
          router.refresh();
        }, 1500);
      }
    } catch {
      setServerError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      turnstileRef.current?.reset();
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
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4">

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

          {/* toggle show/hide */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repite tu contraseña"
                {...register('confirmPassword')}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Ocultar confirmación" : "Mostrar confirmación"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Widget de Turnstile */}
          <div className="flex justify-center py-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)} // <-- Guardamos el token en el estado
              options={{ theme: 'light', size: 'normal' }}
            />
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

          <Button type="submit" className="w-full font-bold" disabled={isSubmitting || !captchaToken}>
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
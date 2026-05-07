'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Schema Cliente
const LoginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const urlError = searchParams.get('error');
  const urlErrorMessage =
    urlError === 'EmailYaRegistrado'
      ? 'Este correo ya tiene una cuenta con contraseña. Inicia sesión con tu email y contraseña.'
      : urlError === 'EmailRegistradoConGoogle'
        ? 'Este correo ya tiene una cuenta vinculada con Google. Usa el botón "Continuar con Google".'
        : urlError === 'OAuthAccountNotLinked'
          ? 'Este correo ya está vinculado a otro proveedor. Usa el método de inicio de sesión original.'
          : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // NextAuth devuelve 'Configuration' o 'CredentialsSignin' usualmente
        setGlobalError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setGlobalError('Ocurrió un error inesperado al intentar iniciar sesión.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <Card className="shadow-lg border-secondary/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif text-primary">Bienvenido de nuevo</CardTitle>
        <CardDescription>
          Ingresa tus datos para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium mt-0">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña <span className="text-destructive">*</span></Label>
              <Link
                href="/auth/reset"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            {/* Toggle show/hide */}
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
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

          {globalError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {globalError}
            </div>
          )}

          {urlErrorMessage && (
            <div className="p-3 rounded-md bg-amber-50 text-amber-800 text-sm font-medium border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
              {urlErrorMessage}
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={isSubmitting || googleLoading}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Entrando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">o continúa con</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Botón Google */}
        <Button
          type="button"
          variant="outline"
          className="w-full font-medium gap-2"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continuar con Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-4 mt-2">
        <p className="text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-primary font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
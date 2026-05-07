'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { resetPassword } from '@/actions/auth-actions';

const Schema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof Schema>;

interface Props {
  token: string;
}

export const ResetPasswordForm = ({ token }: Props) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    const result = await resetPassword(token, data.password);
    if (!result.success && result.message) {
      setErrorMsg(result.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    }
  };

  if (success) {
    return (
      <Card className="shadow-lg border-secondary/20">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-center font-semibold text-lg">¡Contraseña actualizada!</p>
          <p className="text-center text-muted-foreground text-sm">
            Serás redirigido al inicio de sesión en unos segundos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-secondary/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-serif text-primary">
          Nueva contraseña
        </CardTitle>
        <CardDescription>Ingresa y confirma tu nueva contraseña.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t p-4 mt-2">
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          Volver al inicio de sesión
        </Link>
      </CardFooter>
    </Card>
  );
};

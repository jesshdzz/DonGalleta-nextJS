'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
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
import { requestPasswordReset } from '@/actions/auth-actions';

const Schema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type FormValues = z.infer<typeof Schema>;

export const ResetRequestForm = () => {
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = async (data: FormValues) => {
    setErrorMsg('');
    const result = await requestPasswordReset(data.email);
    if (!result.success && result.message) {
      setErrorMsg(result.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <Card className="shadow-lg border-secondary/20">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-center font-semibold text-lg">¡Correo enviado!</p>
          <p className="text-center text-muted-foreground text-sm">
            Si el correo está registrado, recibirás un enlace para restablecer tu
            contraseña. Revisa también tu carpeta de spam.
          </p>
          <Link href="/auth/login" className="text-primary text-sm hover:underline">
            Volver al inicio de sesión
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-secondary/20">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Mail className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl font-serif text-primary">
          Olvidé mi contraseña
        </CardTitle>
        <CardDescription>
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico <span className="text-destructive">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              {...register('email')}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {errorMsg}
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
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

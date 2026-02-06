'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { registerUser } from '@/actions/auth-actions';
import { Loader2 } from "lucide-react";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerUser(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setSuccess('¡Cuenta creada exitosamente!');
        // Redirigir al login después de un breve momento
        setTimeout(() => {
            router.push('/auth/login');
            router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error inesperado');
      setLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej. Juan Pérez"
              type="text"
              autoCapitalize="words"
              autoComplete="name"
              required
              className="bg-white"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              required
              className="bg-white"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              className="bg-white"
            />
          </div>

          {/* Feedback Visual */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              {success}
            </div>
          )}

          <Button type="submit" className="w-full font-bold" disabled={loading}>
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             {loading ? 'Creando cuenta...' : 'Registrarse'}
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
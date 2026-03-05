"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Trash2, User as UserIcon, Mail, Shield, Key } from "lucide-react"; // Añadimos Key

type UserSession = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

export default function VistaPerfil({ user }: { user: UserSession }) {
  const primerNombre = user.name?.split(" ")[0] || "Galletoso";

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 min-h-screen">
      {/* Cabecera del Perfil */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#F7DCBE] p-4 rounded-full border border-[#58321D]/20">
          <UserIcon className="h-10 w-10 text-[#58321D]" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#58321D]">
            Hola, {primerNombre}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información y tu cuenta
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        
        {/* TARJETA 1: Información Personal */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="bg-[#F7DCBE]/10 border-b border-[#A6A3A2]/20 pb-6">
            <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Así es como te vemos en nuestro sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[#58321D] font-bold">
                Nombre
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  defaultValue={user.name || ""}
                  disabled
                  className="pl-9 bg-muted/20 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[#58321D] font-bold">
                Correo Electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  defaultValue={user.email || ""}
                  disabled
                  className="pl-9 bg-muted/20 text-foreground"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-[#58321D] font-bold">
                Tipo de Cuenta
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  defaultValue={
                    user.role === "ADMIN" ? "Administrador" : "Cliente"
                  }
                  disabled
                  className="pl-9 bg-muted/20 font-medium text-[#58321D]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: Seguridad */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
              <Key className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Actualiza tus credenciales de acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            
            {/* BOTÓN: Cambiar Correo */}
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#58321D] text-[#58321D] hover:bg-[#F7DCBE]/30"
              onClick={() => {
                console.log("Compañero: Abrir modal/página para cambiar correo");
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Cambiar Correo
            </Button>

            {/* BOTÓN: Cambiar Contraseña */}
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#58321D] text-[#58321D] hover:bg-[#F7DCBE]/30"
              onClick={() => {
                console.log("Compañero: Abrir modal/página para cambiar contraseña");
              }}
            >
              <Key className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Button>
            
          </CardContent>
        </Card>

        {/* TARJETA 3: Gestión de Sesión y Cuenta (Zona de Peligro) */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#58321D]">
              Gestión de Cuenta
            </CardTitle>
            <CardDescription>
              Opciones para tu sesión y permanencia en la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            {/* BOTÓN: Cerrar Sesión */}
            <Button
              variant="secondary"
              className="w-full sm:w-auto bg-muted hover:bg-muted/80"
              // onClick={() => { Cerrar sesión }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>

            {/* BOTÓN: Eliminar Cuenta */}
            <Button
              variant="destructive"
              className="w-full sm:w-auto bg-[#A42D2C] hover:bg-[#A42D2C]/90"
              // onClick={() => { Eliminar cuenta }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
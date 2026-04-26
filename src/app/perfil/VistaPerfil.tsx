"use client";

import { useState } from "react";
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
// Añadimos FileText a los iconos
import { LogOut, User as UserIcon, Mail, Shield, Key, Pencil, Loader2, Phone, FileText, Gift } from "lucide-react";
import { EditEmailModal } from "@/components/perfil/edit-email-modal";
import { EditPasswordModal } from "@/components/perfil/edit-password-modal";
import { EditPhoneModal } from "@/components/perfil/edit-phone-modal";
// Importamos el nuevo modal de facturación
import { EditInvoiceModal } from "@/components/perfil/edit-invoice-modal";
import { DeleteAccountButton } from "@/components/perfil/delete-account-button";
import { useCart } from "@/context/CartContext";
import { ProfilePhoto } from "@/components/perfil/ProfilePhoto";
import { UploadButton } from "@/lib/uploadthing";
import { updateProfileImage } from "@/actions/user-actions";
import { toast } from "sonner";
import { FavoriteStoreManager } from "@/components/perfil/stores/FavoriteStoreManager";
import { BarraLealtad } from "@/components/loyalty";

// Añadimos el tipo para los datos de facturación
type InvoiceData = {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
  codigoPostal: string;
  usoCFDI: string;
};

type UserSession = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
  phoneNumber?: string | null;
  invoiceData?: InvoiceData | null; // Añadimos la propiedad al usuario
};

export default function VistaPerfil({ user, isOAuthUser }: { user: UserSession; isOAuthUser: boolean }) {
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const { logoutClearCart } = useCart();
  const primerNombre = user.name?.split(" ")[0] || "Galletoso";

  const handleLogout = async () => {
    logoutClearCart();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 min-h-screen">

      {/* --- CABECERA DEL PERFIL --- */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">

        {/* Contenedor del Avatar Interactivo */}
        <div className="relative group h-24 w-24 rounded-full overflow-hidden border-2 border-[#58321D]/20 shadow-sm bg-[#F7DCBE] flex items-center justify-center shrink-0">

          <ProfilePhoto user={{ name: user.name || "", image: user.image || "" }} />

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
            <Pencil className="h-8 w-8 text-white drop-shadow-md" />
          </div>

          <div className="absolute inset-0 z-20">
            <UploadButton
              endpoint="imageUploader"
              onUploadBegin={() => {
                setIsUpdatingPhoto(true);
              }}
              onClientUploadComplete={async (res) => {
                if (res && res[0]) {
                  try {
                    const newUrl = res[0].url;
                    await updateProfileImage(user.id!, newUrl);
                    toast.success("Foto de perfil actualizada", {
                      description: "Tu nueva foto ya es visible para ti.",
                    });
                  } finally {
                    setIsUpdatingPhoto(false);
                  }
                } else {
                  setIsUpdatingPhoto(false);
                }
              }}
              onUploadError={(error: Error) => {
                setIsUpdatingPhoto(false);
                toast.error("Error al subir la imagen", {
                  description: error.message,
                });
              }}
              appearance={{
                container: "w-full h-full m-0 p-0",
                button: "w-full h-full m-0 p-0 opacity-0 cursor-pointer",
                allowedContent: "hidden"
              }}
              content={{
                button: ""
              }}
            />
          </div>

          {isUpdatingPhoto && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 transition-opacity duration-200">
              <Loader2 className="h-6 w-6 text-white animate-spin drop-shadow-md" />
            </div>
          )}
        </div>

        <div className="sm:mt-2">
          <h1 className="text-3xl font-serif font-bold text-[#58321D]">
            Hola, {primerNombre}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información y tu cuenta
          </p>
        </div>
      </div>
      {/* --- FIN CABECERA --- */}

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
              <Label htmlFor="phone" className="text-[#58321D] font-bold">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  defaultValue={user.phoneNumber || "No registrado"}
                  disabled
                  className={`pl-9 bg-muted/20 ${!user.phoneNumber ? 'italic text-muted-foreground' : 'text-foreground'}`}
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

        {/* TARJETA: Programa de Lealtad */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-[#A6A3A2]/20 pb-6">
            <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Programa de Lealtad
            </CardTitle>
            <CardDescription>
              Acumula progreso en cada compra y desbloquea cupones de descuento.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <BarraLealtad />
          </CardContent>
        </Card>

        {/* TARJETA NUEVA: Facturación */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facturación y Datos Fiscales
            </CardTitle>
            <CardDescription>
              Registra tu RFC para poder solicitar facturas de tus pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <EditInvoiceModal userId={user.id!} currentData={user.invoiceData} />
          </CardContent>
        </Card>

        {/* TARJETA 2: Seguridad */}
        <Card className="border-[#A6A3A2]/40 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-[#58321D] flex items-center gap-2">
              <Key className="h-5 w-5" />
              Seguridad y Contacto
            </CardTitle>
            <CardDescription>
              Actualiza tus credenciales y medios de contacto.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap">

            {/* Opciones de telefono/contraseña/email solo para usuarios no-OAuth */}
            {!isOAuthUser && (
              <>
                <EditPhoneModal
                  userId={user.id!}
                  currentPhone={user.phoneNumber || null} />
                <EditEmailModal
                  userId={user.id!}
                  currentEmail={user.email || ""}
                />
                <EditPasswordModal
                  userId={user.id!} />
              </>
            )}
          </CardContent>
        </Card>

        {/* TARJETA DE SUCURSALES FAVORITAS */}
        <FavoriteStoreManager />

        {/* TARJETA 3: Gestión de Cuenta  */}
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
            {/* Cerrar Sesión */}
            <Button
              variant="secondary"
              className="w-full sm:w-auto bg-muted hover:bg-muted/80"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>

            {/* Eliminar Cuenta */}
            <DeleteAccountButton userId={user.id!} isOAuthUser={isOAuthUser} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
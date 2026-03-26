"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { createBanner, getBanners, deleteBanner, toggleBannerStatus } from "@/actions/banner-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import "@uploadthing/react/styles.css";
type Banner = {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

export default function AdminBannersPage() {
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  const loadBanners = async () => {
    setIsLoadingBanners(true);
    const data = await getBanners();
    setBanners(data as Banner[]);
    setIsLoadingBanners(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setBanners(banners.map(b => b.id === id ? { ...b, isActive: !currentStatus } : b));
    const result = await toggleBannerStatus(id, !currentStatus);
    if (!result.success) {
      alert(result.error);
      loadBanners();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este banner permanentemente?")) return;
    setBanners(banners.filter((b: Banner) => b.id !== id));
    const result = await deleteBanner(id);
    if (!result.success) {
      alert(result.error);
      loadBanners();
    }
  };

  return (
    // Ajuste de padding: menos espacio en celular (p-4), normal en desktop (sm:p-6)
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 sm:space-y-8 mb-20">
      <div className="mb-4 sm:mb-8">
        {/* Ajuste de título: más pequeño en móvil */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#58321D]">Gestión de Banners</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Sube y administra las imágenes promocionales de la página principal.</p>
      </div>

      {/* FORMULARIO */}
      <Card className="border-[#A6A3A2]/40 shadow-sm">
        <CardHeader className="bg-[#F7DCBE]/10 border-b border-[#A6A3A2]/20 pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#58321D] flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Añadir Nuevo Banner
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Llena los datos de tu promoción y luego arrastra la imagen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          {/* El grid ya estaba responsivo (grid-cols-1 a md:grid-cols-2), lo dejamos igual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-[#58321D]">Título <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                placeholder="Ej: Promo San Valentín 2x1" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enlace" className="font-bold text-[#58321D]">Enlace (Opcional)</Label>
              <Input 
                id="enlace" 
                placeholder="Ej: /productos" 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="border-2 border-dashed rounded-lg p-3 sm:p-4 bg-muted/10 relative">
            {!title && (
              <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg p-4 text-center">
                <span className="bg-background px-3 py-2 sm:px-4 sm:py-2 rounded-md shadow-sm text-xs sm:text-sm font-medium text-destructive">
                  Escribe un título primero para habilitar la subida
                </span>
              </div>
            )}

            {/* Mostramos el loader cuando isSaving es true */}
            {isSaving && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-muted-foreground">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-2 text-primary" />
                <p className="text-sm sm:text-base">Guardando banner...</p>
              </div>
            )}
            
            {/* Mantenemos el componente montado pero oculto visualmente si isSaving es true,
                para que no se interrumpa el onClientUploadComplete */}
            <div className={isSaving ? "hidden" : "block"}>
              <UploadDropzone<OurFileRouter, "bannerImage">
                endpoint="bannerImage"
                onUploadBegin={() => setIsSaving(true)}
                onClientUploadComplete={async (res) => {
                  if (res && res[0]) {
                    await createBanner({
                      title: title,
                      imageUrl: res[0].url,
                      targetUrl: targetUrl
                    });
                    setTitle("");
                    setTargetUrl("");
                    setIsSaving(false);
                    loadBanners();
                  }
                }}
                onUploadError={(error: Error) => {
                  setIsSaving(false);
                  alert(`Error: ${error.message}`);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Card className="border-[#A6A3A2]/40 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-[#58321D]">Banners Registrados</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Activa o desactiva los banners que se mostrarán en el carrusel principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBanners ? (
            <div className="flex justify-center py-6 sm:py-8">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
              No hay banners registrados aún.
            </div>
          ) : (
            // MAGIA RESPONSIVA: overflow-x-auto permite hacer scroll lateral en celular si la tabla es muy ancha
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]"> 
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] sm:w-[100px]">Imagen</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Enlace</TableHead>
                    <TableHead className="text-center w-[80px]">Activo</TableHead>
                    <TableHead className="text-right w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <div className="relative h-10 w-16 sm:h-12 sm:w-20 rounded overflow-hidden bg-secondary">
                          <Image 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm sm:text-base">{banner.title}</TableCell>
                      <TableCell>
                        {banner.targetUrl ? (
                          <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">
                            {banner.targetUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch 
                          checked={banner.isActive} 
                          onCheckedChange={() => handleToggleStatus(banner.id, banner.isActive)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    onChange: (url: string) => void;
    onRemove: () => void;
    value: string;
}

export function ImageUpload({ onChange, onRemove, value }: ImageUploadProps) {
    // Si ya hay una imagen subida, mostramos la previsualización
    if (value) {
        return (
            <div className="relative w-full h-50 rounded-md overflow-hidden border border-border">
                <div className="absolute top-2 right-2 z-10">
                    <Button variant="destructive" size="icon" onClick={onRemove} type="button">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <Image
                    src={value}
                    alt="Product Upload"
                    className="object-contain w-full h-full"
                    width={500}
                    height={500}
                />
            </div>
        );
    }

    // Si no hay imagen, mostramos la zona de arrastrar y soltar
    return (
        <UploadDropzone
            endpoint="productImage"
            onClientUploadComplete={(res) => {
                // res es un array de archivos subidos, tomamos la URL del primero
                if (res?.[0].url) {
                    onChange(res[0].url);
                }
            }}
            onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
            }}
            content={{
                label: "Elige una imagen o arrástrala aquí",
                allowedContent: "Imágenes de hasta 4MB (PNG, JPG)",
                button: ({ ready, isUploading, files, uploadProgress}) => {
                    if (isUploading) return "Subiendo...";
                    if (files.length > 1) return "Solo se permite un archivo";
                    if (files.length == 1) return `subir archivo seleccionado`;
                    if (ready && !isUploading) return "Seleccionar Archivo";
                },
            }}
            appearance={{
                container: "border-border bg-muted/20 border-2 border-dashed rounded-lg p-10 cursor-pointer hover:bg-muted/40 transition-colors",
                label: "text-primary font-serif font-bold text-2xl h-auto",
                allowedContent: "text-muted-foreground mt-2 h-auto",
                button: "bg-primary text-primary-foreground hover:bg-primary/90 mt-4 px-6 py-2 rounded-md font-medium text-sm transition-colors ut-uploading:cursor-not-allowed ut-uploading:bg-primary/50 after:bg-primary",
                uploadIcon: "text-muted-foreground w-12 h-12 mb-4",
            }}
        />
    );
}
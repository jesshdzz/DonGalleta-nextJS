"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string | null;
  description?: string | null;
  stock?: number; // Agregué stock opcional para mostrar badge
}

export default function ProductoItem({ product }: { product: Product }) {
  // Conversión segura de precio
  const priceValue = typeof product.price === 'string' 
    ? parseFloat(product.price.replace(/[^0-9.-]/g, '')) 
    : product.price;

  // Lógica de imagen (placeholder)
  const imageUrl = product.image && product.image.trim() !== "" 
    ? product.image 
    : "https://placehold.co/400x400/png?text=Sin+Imagen";

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 group">
      {/* Header con Imagen */}
      <div className="relative aspect-square overflow-hidden bg-secondary/30">
        <Image
          src={imageUrl}
          alt={product.name || "Producto"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        {/* Badge flotante si es necesario (ej: Nuevo, Oferta, Poco stock) */}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 shadow-sm">
            Agotado
          </Badge>
        )}
      </div>

      {/* Contenido */}
      <CardContent className="grow p-5 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name || "Sin nombre"}
          </h3>
        </div>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="pt-2">
          <span className="text-2xl font-bold text-primary">
            ${!isNaN(Number(priceValue)) ? Number(priceValue).toFixed(2) : "0.00"}
          </span>
        </div>
      </CardContent>

      {/* Footer con Botón */}
      <CardFooter className="p-5 pt-0">
        <Link href={`/productos/descripcion/${product.id}`} className="w-full">
          <Button className="w-full font-bold shadow-sm" size="lg">
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
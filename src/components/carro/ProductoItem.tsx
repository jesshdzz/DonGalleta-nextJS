"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddToCartCarousel from "@/components/carro/AddToCartCarousel";
import FavoriteButton from "@/components/ui/favorite-button";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string | null;
  description?: string | null;
  stock: number; // Requerido para coincidir con AddToCartCarousel
}

interface ProductoItemProps {
  product: Product;
  initialIsFavorite?: boolean;
}

export default function ProductoItem({ product, initialIsFavorite = false }: ProductoItemProps) {
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
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={false}
        />
        
        {/* Botón de favoritos */}
        <div className="absolute top-2 right-2">
          <FavoriteButton 
            productId={product.id}
            initialIsFavorite={initialIsFavorite}
            size="md"
            variant="ghost"
          />
        </div>
        
        {/* Badge flotante si es necesario (ej: Nuevo, Oferta, Poco stock) */}
        {product.stock === 0 && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 shadow-sm text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5"
          >
            Agotado
          </Badge>
        )}
      </div>
      <CardContent className="grow p-3 sm:p-5 space-y-1 sm:space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-sm sm:text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name || "Sin nombre"}
          </h3>
        </div>
        <div className="pt-0 sm:pt-2">
          <span className="text-lg sm:text-2xl font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
      </CardContent>
      {/* Botón de agregar al carrito - Le devolvemos su pb-1 en escritorio como en el Home */}
      <div className="px-3 sm:px-5 pb-0 sm:pb-1">
        <AddToCartCarousel product={product} />
      </div>

      {/* Footer con Botón - Cambiamos el agresivo -mt-4 por el sutil -mt-2 */}
      <CardFooter className="p-3 sm:p-5 pt-0 sm:pt-0 -mt-2 sm:-mt-1">
        <Link href={`/productos/${product.id}`} className="w-full block">
          <Button 
            className="w-full font-bold shadow-sm h-9 sm:h-11 text-xs sm:text-base" 
            variant="secondary"
          >
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

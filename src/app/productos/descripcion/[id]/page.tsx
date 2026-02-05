import { getProducts } from "@/actions/product-actions";
import AddToCartButton from "@/components/carro/AddToCartButton";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, XCircle, Package } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>; // En Next.js 15+ params es una Promesa
}

export default async function ProductDetailPage({ params }: Props) {
  // 1. Desempaquetar los parámetros (obligatorio en Next.js reciente)
  const { id } = await params;
  const productId = parseInt(id);

  // Validación: si el ID no es un número válido
  if (isNaN(productId)) {
    notFound();
  }

  // 2. Obtener datos desde el Server Action
  const products = await getProducts();
  const product = products.find(p => p.id === productId);

  // Si no existe el producto, mostrar página 404
  if (!product) {
    notFound();
  }

  // 3. Lógica de imagen (Placeholder si está vacía)
  const imageUrl = product.image && product.image.trim() !== "" 
    ? product.image 
    : "https://placehold.co/600x600/png?text=Sin+Imagen";

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      
      {/* Botón Volver */}
      <div className="mb-8">
        <Link href="/productos">
          <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al catálogo
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary/20 border border-border/50 shadow-sm group">
          <Image
            src={imageUrl}
            alt={product.name}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        {/* COLUMNA DERECHA: INFORMACIÓN */}
        <div className="flex flex-col space-y-8">
          <div>
            <div className="flex justify-between items-start">
               <h1 className="text-4xl font-bold text-primary mb-3 tracking-tight">{product.name}</h1>
               {/* Badge de Stock */}
               {product.stock > 0 ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5 px-3 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> En stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                  <XCircle className="w-3.5 h-3.5" /> Agotado
                </Badge>
              )}
            </div>

            <p className="text-3xl font-bold text-foreground mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>
          
          <Card className="bg-secondary/10 border-none shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
                 <Package className="w-4 h-4" /> Descripción
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "Este producto es una deliciosa creación de la casa, elaborada con los mejores ingredientes para garantizar su frescura y sabor."}
              </p>
            </CardContent>
          </Card>
          
          <div className="pt-6 border-t border-border">
            {product.stock > 0 ? (
              <div className="space-y-4">
                {/* Botón de Añadir al Carrito (Componente Cliente) */}
                <div className="w-full">
                    <AddToCartButton product={{ ...product, quantity: 1 }} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Envío calculado al finalizar la compra.
                </p>
              </div>
            ) : (
              <Button disabled size="lg" className="w-full text-lg opacity-80" variant="secondary">
                No disponible por el momento
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
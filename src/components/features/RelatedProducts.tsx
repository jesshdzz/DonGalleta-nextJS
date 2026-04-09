import Image from "next/image";
import Link from "next/link";
import { getRelatedProducts } from "@/actions/product-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RelatedProductsProps {
  currentProductId: number;
}

export async function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  // Solo necesitamos pasar el ID del producto actual
  const products = await getRelatedProducts(currentProductId, 4);

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-[#A6A3A2]/20 pt-10 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#58321D] mb-8">
          También te podría gustar...
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="overflow-hidden border-[#A6A3A2]/30 hover:border-[#58321D]/50 transition-colors group flex flex-col h-full"
            >
              <Link href={`/productos/${product.id}`} className="flex flex-col flex-1">
                <div className="relative aspect-square w-full bg-[#F7DCBE]/20 overflow-hidden">
                  {product.image ? (
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                      Sin imagen
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#58321D] line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground italic line-clamp-1">
                      {/* Extraemos los nombres de los sabores desde la relación de Prisma */}
                      {product.flavors && product.flavors.length > 0 
                        ? product.flavors.map(pf => pf.flavor.name).join(", ")
                        : "Clásica"
                      }
                    </p>
                  </div>
                  <p className="font-black text-xl text-[#58321D]">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </CardContent>
              </Link>
              
              <div className="p-4 pt-0 mt-auto">
                <Button asChild className="w-full bg-[#58321D] hover:bg-[#58321D]/90 text-white font-medium">
                  {/* Usamos el slug en la URL ya que lo tienes como @unique en tu esquema */}
                  <Link href={`/productos/${product.id}`}>Ver detalles</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
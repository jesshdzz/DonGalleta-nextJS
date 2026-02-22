import { searchProducts } from "@/actions/product-actions";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

// Ajustamos la firma para que Next.js sepa que searchParams es asíncrono
export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Esperamos a que los parámetros estén listos
  const params = await searchParams;
  
  // Extraemos la 'q' de manera segura
  const query = typeof params.q === 'string' ? params.q : "";
  
  // Llamamos a la base de datos sin límite
  const results = await searchProducts(query);

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Resultados de búsqueda
        </h1>
        <p className="text-muted-foreground">
          Buscaste: <span className="font-semibold text-foreground">"{query}"</span> 
          ({results.length} resultados)
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-card flex flex-col">
              {/* Aquí asumo que tienes un campo image en tu base de datos */}
              <div className="aspect-square relative w-full mb-4 bg-muted/20 rounded-md flex items-center justify-center">
                 {product.image ? (
                   <Image src={product.image} alt={product.name} fill className="object-cover rounded-md" />
                 ) : (
                   <Cookie className="h-16 w-16 text-muted-foreground/30" />
                 )}
              </div>
              
              <h2 className="text-lg font-bold text-primary mb-1">{product.name}</h2>
              <p className="text-sm text-muted-foreground italic mb-4 flex-1">
                {product.flavorText || "Clásica"}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                <Link href={`/productos/${product.id}`}>
                  <Button size="sm">Ver producto</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/10 rounded-lg border border-border mt-8">
          <Cookie className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-primary mb-2">¡Ups! No hay galletas aquí</h2>
          <p className="text-muted-foreground mb-6">
            No encontramos ninguna galleta que coincida con "{query}".
          </p>
          <Link href="/productos">
            <Button>Ver todo el catálogo</Button>
          </Link>
        </div>
      )}
    </div>
  );
}